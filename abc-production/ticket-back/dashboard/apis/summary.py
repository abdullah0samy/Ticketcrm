"""Consolidated dashboard summary.

The existing `/api/dashboard/ticket/` powers the statistics charts. This adds a
single call that returns everything a landing dashboard needs — counts, SLA
health, priority mix, agent workload and recent activity — so the page doesn't
have to fan out to five endpoints.
"""
from datetime import timedelta

from django.db.models import Avg, Count, F, Q
from django.utils.timezone import now
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.status import HTTP_200_OK
from rest_framework.views import APIView

from ticket.models.choices import TicketPriority, TicketStatus
from ticket.models.models import Ticket

CLOSED_STATES = [TicketStatus.COMPLETE, TicketStatus.CLOSED]


class DashboardSummaryAPIView(APIView):
    """GET /api/dashboard/summary/?days=30"""

    permission_classes = [IsAuthenticated]

    def _scope(self, request):
        """Global admins see everything; everyone else sees their department."""
        qs = Ticket.objects.all()
        department = getattr(request.user, "department", None)
        if department is not None:
            qs = qs.filter(Q(department=department) | Q(complaint__department=department))
        return qs

    def get(self, request):
        try:
            days = max(1, min(int(request.query_params.get("days", 30)), 365))
        except (TypeError, ValueError):
            days = 30

        since = now() - timedelta(days=days)
        qs = self._scope(request)
        window = qs.filter(created_at__gte=since)
        current = timezone_now = now()

        open_qs = qs.exclude(status__in=CLOSED_STATES)

        # --- headline counters -------------------------------------------
        stats = {
            "total": qs.count(),
            "in_window": window.count(),
            "open": open_qs.count(),
            "on_hold": qs.filter(status=TicketStatus.ON_HOLD).count(),
            "in_progress": qs.filter(status=TicketStatus.IN_PROGRESS).count(),
            "complete": qs.filter(status=TicketStatus.COMPLETE).count(),
            "closed": qs.filter(status=TicketStatus.CLOSED).count(),
            "unassigned": open_qs.filter(assigned_to__isnull=True).count(),
            "overdue": open_qs.filter(sla_deadline__lt=current).count(),
            "due_soon": open_qs.filter(
                sla_deadline__gte=current,
                sla_deadline__lte=current + timedelta(hours=24),
            ).count(),
        }

        # SLA adherence over completed tickets that had a deadline
        finished = qs.filter(status__in=CLOSED_STATES, sla_deadline__isnull=False)
        finished_total = finished.count()
        met = finished.filter(completed_at__lte=F("sla_deadline")).count()
        stats["sla_met"] = met
        stats["sla_breached"] = finished_total - met
        stats["sla_adherence"] = round(met / finished_total * 100, 1) if finished_total else None

        avg = qs.filter(resolution_time__isnull=False).aggregate(v=Avg("resolution_time"))["v"]
        stats["avg_resolution_hours"] = round(avg.total_seconds() / 3600, 1) if avg else None

        # --- distributions -------------------------------------------------
        priority_counts = {row["priority"]: row["c"]
                           for row in qs.values("priority").annotate(c=Count("id"))}
        priority_distribution = [
            {"priority": p.value, "label": str(p.label), "count": priority_counts.get(p.value, 0)}
            for p in TicketPriority
        ]

        status_counts = {row["status"]: row["c"]
                         for row in qs.values("status").annotate(c=Count("id"))}
        status_distribution = [
            {"status": s.value, "label": str(s.label), "count": status_counts.get(s.value, 0)}
            for s in TicketStatus
        ]

        # --- agent workload ------------------------------------------------
        agents = (
            qs.filter(assigned_to__isnull=False)
            .values("assigned_to__id", "assigned_to__first_name", "assigned_to__last_name")
            .annotate(
                total=Count("id"),
                resolved=Count("id", filter=Q(status__in=CLOSED_STATES)),
                overdue=Count("id", filter=Q(sla_deadline__lt=current) & ~Q(status__in=CLOSED_STATES)),
            )
            .order_by("-total")[:8]
        )
        agent_performance = [
            {
                "id": a["assigned_to__id"],
                "name": f"{a['assigned_to__first_name']} {a['assigned_to__last_name']}".strip()
                        or f"#{a['assigned_to__id']}",
                "total": a["total"],
                "resolved": a["resolved"],
                "overdue": a["overdue"],
                "resolution_rate": round(a["resolved"] / a["total"] * 100, 1) if a["total"] else 0,
            }
            for a in agents
        ]

        # --- department load ------------------------------------------------
        departments = (
            qs.values("department__id", "department__name")
            .annotate(
                total=Count("id"),
                open=Count("id", filter=~Q(status__in=CLOSED_STATES)),
                overdue=Count("id", filter=Q(sla_deadline__lt=current) & ~Q(status__in=CLOSED_STATES)),
            )
            .order_by("-total")[:8]
        )
        department_load = [
            {
                "id": d["department__id"],
                "name": d["department__name"],
                "total": d["total"],
                "open": d["open"],
                "overdue": d["overdue"],
            }
            for d in departments
        ]

        # --- recent activity --------------------------------------------------
        recent = (
            qs.select_related("department", "assigned_to", "complaint")
            .order_by("-created_at")[:8]
        )
        recent_activity = [
            {
                "id": t.id,
                "ticket_number": t.ticket_number,
                "description": (t.subject or t.description or "")[:90],
                "status": t.status,
                "priority": t.priority,
                "department": t.department.name if t.department else None,
                "assigned_to": (f"{t.assigned_to.first_name} {t.assigned_to.last_name}".strip()
                                if t.assigned_to else None),
                "created_at": t.created_at,
                "is_overdue": bool(t.sla_deadline and t.sla_deadline < current
                                   and t.status not in CLOSED_STATES),
            }
            for t in recent
        ]

        # --- daily trend -------------------------------------------------------
        trend_map = {}
        for t in window.values_list("created_at", flat=True):
            key = t.date().isoformat()
            trend_map[key] = trend_map.get(key, 0) + 1
        trend = []
        for i in range(days - 1, -1, -1):
            day = (timezone_now - timedelta(days=i)).date().isoformat()
            trend.append({"date": day, "count": trend_map.get(day, 0)})

        return Response(
            {
                "stats": stats,
                "priority_distribution": priority_distribution,
                "status_distribution": status_distribution,
                "agent_performance": agent_performance,
                "department_load": department_load,
                "recent_activity": recent_activity,
                "trend": trend,
                "range_days": days,
            },
            status=HTTP_200_OK,
        )

"""Scan open tickets for SLA warnings and breaches and notify the people involved.

Run every few minutes:

    python manage.py check_sla                # act
    python manage.py check_sla --dry-run      # report only

Each ticket is notified at most once per stage — `sla_warning_sent` and
`sla_breach_sent` guard against re-notifying on every run.
"""
from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone
from django.utils.translation import gettext as _

from ticket.models.choices import TicketStatus
from ticket.models.models import Ticket
from users.models.models import Notification

# Warn once a ticket has burned this share of its allotted time.
WARNING_THRESHOLD = 0.8


class Command(BaseCommand):
    help = "Notify on tickets approaching or past their SLA deadline."

    def add_arguments(self, parser):
        parser.add_argument("--dry-run", action="store_true",
                            help="Report without writing or notifying.")

    def _recipients(self, ticket):
        """Assignee first; fall back to the reporter so someone always hears."""
        users = []
        if ticket.assigned_to_id:
            users.append(ticket.assigned_to)
        elif ticket.complaint_id:
            users.append(ticket.complaint)
        return users

    def _notify(self, ticket, message, dry):
        if dry:
            return 0
        made = 0
        for user in self._recipients(ticket):
            Notification.objects.create(user=user, message=message, types=2)
            made += 1
        return made

    def handle(self, *args, **options):
        dry = options["dry_run"]
        now = timezone.now()

        open_tickets = (
            Ticket.objects
            .exclude(status__in=[TicketStatus.COMPLETE, TicketStatus.CLOSED])
            .filter(sla_deadline__isnull=False)
            .select_related("assigned_to", "complaint", "department")
        )

        warned = breached = notifications = 0

        with transaction.atomic():
            for ticket in open_tickets:
                ref = ticket.ticket_number or f"#{ticket.pk}"

                # --- breach ---
                if now > ticket.sla_deadline:
                    if not ticket.sla_breach_sent:
                        notifications += self._notify(
                            ticket,
                            _("SLA breached for ticket %(ref)s") % {"ref": ref},
                            dry,
                        )
                        if not dry:
                            Ticket.objects.filter(pk=ticket.pk).update(
                                sla_breach_sent=True, sla_warning_sent=True)
                        breached += 1
                    continue

                # --- approaching ---
                total = (ticket.sla_deadline - ticket.created_at).total_seconds()
                if total <= 0:
                    continue
                elapsed = (now - ticket.created_at).total_seconds()
                if elapsed / total >= WARNING_THRESHOLD and not ticket.sla_warning_sent:
                    notifications += self._notify(
                        ticket,
                        _("Ticket %(ref)s is approaching its SLA deadline") % {"ref": ref},
                        dry,
                    )
                    if not dry:
                        Ticket.objects.filter(pk=ticket.pk).update(sla_warning_sent=True)
                    warned += 1

            if dry:
                transaction.set_rollback(True)

        self.stdout.write(self.style.SUCCESS(
            f"{'[dry-run] ' if dry else ''}scanned {open_tickets.count()} open tickets — "
            f"warnings: {warned} | breaches: {breached} | notifications: {notifications}"
        ))

"""Backfill the ticket fields introduced alongside priority/SLA/assignment.

Existing rows predate `ticket_number`, `sla_deadline` and `completed_at`, so they
would otherwise render as blanks in the UI and be invisible to the SLA checker.

    python manage.py backfill_ticket_fields [--dry-run]

Idempotent: only touches rows where the target field is still empty.
"""
import random

from django.core.management.base import BaseCommand
from django.db import transaction

from ticket.models.choices import TicketStatus
from ticket.models.models import Ticket


class Command(BaseCommand):
    help = "Populate ticket_number / sla_deadline / completed_at on pre-existing tickets."

    def add_arguments(self, parser):
        parser.add_argument(
            "--dry-run", action="store_true",
            help="Report what would change without writing.",
        )
        parser.add_argument(
            "--spread-priority", action="store_true",
            help="Give existing tickets a varied priority instead of leaving them all 'normal' "
                 "(useful for demo data only).",
        )

    def handle(self, *args, **options):
        dry = options["dry_run"]
        spread = options["spread_priority"]
        rng = random.Random(20260728)

        stats = {"number": 0, "sla": 0, "completed": 0, "priority": 0}
        qs = Ticket.objects.all().select_related("department")

        with transaction.atomic():
            for ticket in qs:
                fields = []

                if not ticket.ticket_number:
                    ticket.ticket_number = f"TKT-{ticket.pk:06d}"
                    fields.append("ticket_number")
                    stats["number"] += 1

                if spread and ticket.priority == "normal":
                    ticket.priority = rng.choice(["low", "normal", "normal", "high", "critical"])
                    fields.append("priority")
                    stats["priority"] += 1

                if not ticket.sla_deadline:
                    ticket.sla_deadline = ticket.compute_sla_deadline()
                    fields.append("sla_deadline")
                    stats["sla"] += 1

                if (ticket.status in (TicketStatus.COMPLETE, TicketStatus.CLOSED)
                        and not ticket.completed_at):
                    ticket.completed_at = ticket.closed_at or ticket.created_at
                    fields.append("completed_at")
                    stats["completed"] += 1

                if fields and not dry:
                    # update_fields avoids re-running model validation on legacy rows
                    Ticket.objects.filter(pk=ticket.pk).update(
                        **{f: getattr(ticket, f) for f in fields}
                    )

            if dry:
                transaction.set_rollback(True)

        self.stdout.write(
            self.style.SUCCESS(
                f"{'[dry-run] ' if dry else ''}"
                f"ticket_number: {stats['number']} | sla_deadline: {stats['sla']} | "
                f"completed_at: {stats['completed']} | priority: {stats['priority']}"
            )
        )

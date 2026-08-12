from django.apps import AppConfig


class CatalogConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'catalog'

    def ready(self):
        """Connect the audit trail once the app registry is populated."""
        from django.apps import apps

        from catalog.audit import register_audit

        # Everything a person can change that matters for a hospital's records.
        # AuditLog itself is deliberately absent — auditing the audit log
        # recurses forever.
        auditable = [
            ("ticket", "Ticket"),
            ("ticket", "TicketComment"),
            ("ticket", "TicketTransfer"),
            ("ticket", "ISSUESType"),
            ("ticket", "Note"),
            ("users", "UserInfo"),
            ("users", "Department"),
            ("users", "DeptPermissions"),
            ("users", "UserPermissionOverride"),
            ("catalog", "Building"),
            ("catalog", "Floor"),
            ("catalog", "Asset"),
            ("catalog", "KnowledgeCategory"),
            ("catalog", "KnowledgeArticle"),
        ]
        for app_label, model_name in auditable:
            try:
                register_audit(apps.get_model(app_label, model_name))
            except LookupError:
                # A model that does not exist in this deployment is not an error.
                continue

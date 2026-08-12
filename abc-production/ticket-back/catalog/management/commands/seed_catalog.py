"""Seed the catalog tables.

Buildings and floors are imported from the hardcoded `Buildings`/`Floors`
TextChoices (and the `BUILD` map) that the ticket app still uses, so the new
admin screens start out consistent with existing ticket data instead of empty.

    python manage.py seed_catalog [--demo]
"""
import random

from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone

from catalog.models import (Asset, AssetStatus, AuditLog, Building, Floor,
                            KnowledgeArticle, KnowledgeCategory)
from ticket.models.choices import Buildings, Floors
from ticket.utils import BUILD
from users.models.models import Department, UserInfo

AR_BUILDING = {
    "building_1": "المبنى الأول",
    "building_2": "المبنى الثاني",
    "stores": "المخازن",
}

AR_FLOOR = {
    "basement": "البدروم", "ground": "الأرضي", "admin": "الإداري",
    "el_hegaz": "الحجاز", "lebanon_sqaure": "ميدان لبنان",
    "floor_1": "الطابق الأول", "floor_2": "الطابق الثاني", "floor_3": "الطابق الثالث",
    "floor_4": "الطابق الرابع", "floor_5": "الطابق الخامس", "floor_6": "الطابق السادس",
    "floor_7": "الطابق السابع", "laboratory": "المعمل", "endoscopy": "المناظير",
    "or": "غرفة العمليات",
}

DEMO_ASSETS = [
    ("جهاز أشعة رقمي", "RAD-2201", "Medical Device", "قسم الأشعة", "active"),
    ("جهاز تخطيط قلب", "ECG-1180", "Medical Device", "العناية المركزة", "active"),
    ("خادم قاعدة البيانات", "SRV-0042", "IT Hardware", "غرفة الخوادم", "active"),
    ("طابعة ليزر", "PRN-3310", "IT Hardware", "الاستقبال", "maintenance"),
    ("جهاز كمبيوتر مكتبي", "PC-7781", "IT Hardware", "العيادات", "active"),
    ("جهاز بصمة", "FP-0091", "IT Hardware", "المدخل الرئيسي", "active"),
    ("شاشة عرض طبية", "MON-5540", "Medical Device", "غرفة العمليات", "retired"),
    ("موزع شبكة", "SW-2280", "Network", "غرفة الاتصالات", "active"),
    ("جهاز تعقيم", "STE-4410", "Medical Device", "قسم التعقيم", "active"),
]

DEMO_KB = [
    ("مشاكل الأجهزة", "Hardware Issues", [
        ("كيف أعيد تشغيل جهازي بأمان", "How to safely restart your PC",
         "أغلق كل البرامج المفتوحة ثم اختر «إعادة التشغيل» من قائمة ابدأ. لا تفصل الكهرباء مباشرة.",
         "Close all open applications, then choose Restart from the Start menu. Never cut power directly."),
        ("حل مشكلة الطابعة المحشورة", "Fixing a paper jam",
         "افتح الغطاء الخلفي واسحب الورق برفق في اتجاه مسار الطباعة ثم أعد تشغيل الطابعة.",
         "Open the rear cover, gently pull the paper along the feed direction, then power-cycle the printer."),
    ]),
    ("الشبكة والاتصال", "Network & Connectivity", [
        ("خطوات الاتصال بشبكة المستشفى", "Connecting to the hospital network",
         "اختر شبكة ABC-Staff وأدخل بيانات حسابك الوظيفي. لا تستخدم شبكة الزوار للأنظمة الطبية.",
         "Select ABC-Staff and sign in with your staff account. Do not use the guest network for clinical systems."),
    ]),
    ("الحسابات والصلاحيات", "Accounts & Access", [
        ("طلب صلاحية جديدة", "Requesting new access",
         "قدّم تذكرة من نوع «طلب صلاحية» مرفقاً بها موافقة رئيس القسم.",
         "Submit an Access Request ticket with your department head approval attached."),
    ]),
    ("الأنظمة والبرمجيات", "Software & Systems", [
        ("ماذا تفعل عند بطء النظام", "What to do when the system is slow",
         "أغلق التبويبات غير المستخدمة ثم أعد تشغيل المتصفح. إن استمرت المشكلة افتح تذكرة.",
         "Close unused tabs and restart the browser. If it persists, open a ticket."),
    ]),
]


class Command(BaseCommand):
    help = "Populate buildings/floors from the legacy enums, plus optional demo content."

    def add_arguments(self, parser):
        parser.add_argument("--demo", action="store_true",
                            help="Also create sample assets, knowledge articles and audit entries.")

    @transaction.atomic
    def handle(self, *args, **options):
        rng = random.Random(20260728)

        # --- buildings & floors from the hardcoded choices -----------------
        buildings = {}
        for code, label in Buildings.choices:
            b, _ = Building.objects.get_or_create(
                code=code,
                defaults={"name_en": str(label), "name_ar": AR_BUILDING.get(code, str(label))},
            )
            buildings[code] = b

        floor_labels = dict(Floors.choices)
        floors_made = 0
        for b_code, floor_codes in BUILD.items():
            building = buildings.get(b_code)
            if not building:
                continue
            for f_code in floor_codes:
                _, created = Floor.objects.get_or_create(
                    building=building, code=f_code,
                    defaults={
                        "name_en": str(floor_labels.get(f_code, f_code)),
                        "name_ar": AR_FLOOR.get(f_code, f_code),
                    },
                )
                floors_made += int(created)

        self.stdout.write(f"  buildings: {len(buildings)} | floors: {Floor.objects.count()} "
                          f"(+{floors_made} new)")

        if not options["demo"]:
            self.stdout.write(self.style.SUCCESS("catalog seeded (reference data only)"))
            return

        # --- demo assets -----------------------------------------------------
        dept = Department.objects.filter(reciever=True).first()
        for name, serial, a_type, location, status in DEMO_ASSETS:
            Asset.objects.get_or_create(
                serial_number=serial,
                defaults={
                    "name": name, "asset_type": a_type, "location": location,
                    "department": dept, "status": status,
                    "purchase_date": (timezone.now() - timezone.timedelta(days=rng.randint(200, 1200))).date(),
                    "warranty_expiry": (timezone.now() + timezone.timedelta(days=rng.randint(30, 900))).date(),
                },
            )

        # --- demo knowledge base ---------------------------------------------
        author = UserInfo.objects.filter(is_superuser=True).first()
        for cat_ar, cat_en, articles in DEMO_KB:
            category, _ = KnowledgeCategory.objects.get_or_create(
                name_en=cat_en, defaults={"name_ar": cat_ar})
            for t_ar, t_en, c_ar, c_en in articles:
                KnowledgeArticle.objects.get_or_create(
                    title_en=t_en,
                    defaults={
                        "category": category, "title_ar": t_ar,
                        "content_ar": c_ar, "content_en": c_en,
                        "author": author, "views": rng.randint(5, 240),
                    },
                )

        # --- a few audit entries so the screen isn't empty ---------------------
        if not AuditLog.objects.exists():
            users = list(UserInfo.objects.all())
            samples = [
                ("TICKET_CREATED", "Ticket"), ("TICKET_STATUS_CHANGED", "Ticket"),
                ("TICKET_TRANSFERRED", "Ticket"), ("TICKET_ASSIGNED", "Ticket"),
                ("USER_UPDATED", "UserInfo"), ("ASSET_CREATED", "Asset"),
            ]
            for i in range(24):
                action, entity = rng.choice(samples)
                AuditLog.objects.create(
                    user=rng.choice(users) if users else None,
                    action=action, entity_type=entity, entity_id=str(rng.randint(1, 60)),
                    old_data={"status": "on_hold"} if "STATUS" in action else None,
                    new_data={"status": "in_progress"} if "STATUS" in action else None,
                    ip_address=f"10.10.1.{rng.randint(2, 250)}",
                    user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
                    created_at=timezone.now() - timezone.timedelta(hours=rng.randint(1, 700)),
                )

        self.stdout.write(self.style.SUCCESS(
            f"catalog seeded — assets: {Asset.objects.count()} | "
            f"kb categories: {KnowledgeCategory.objects.count()} | "
            f"kb articles: {KnowledgeArticle.objects.count()} | "
            f"audit entries: {AuditLog.objects.count()}"
        ))

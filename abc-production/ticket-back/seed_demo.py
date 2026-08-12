"""
DEMO data seed for the ABC production system — LOCAL DEVELOPMENT ONLY.

Creates issue types, a spread of tickets across every status/building/floor with
comments and notes, plus the PR survey side (templates, questions, surveys with
answers) so the dashboards have real content.

Run:
    .venv/Scripts/python.exe seed_demo.py

Re-runnable: it clears the demo transactional rows first (tickets, surveys, notes)
but never touches users or departments.

⚠️ NEVER run this against the live server database.
"""
import io
import os
import random
import sys
from datetime import timedelta

import django

# The Windows console defaults to cp1252, which cannot encode the Arabic strings
# or emoji this script prints.
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "ABCHospital.settings_local")
django.setup()

from django.utils import timezone  # noqa: E402

from pr.models.choices import QuestionCategory, QuestionType, QuestionWeight, SurveyType  # noqa: E402
from pr.models.models import Survey, SurveyAnswer, SurveyInfo, SurveyQuestion, SurveyTemplate  # noqa: E402
from ticket.models.choices import Buildings, Floors, TicketStatus  # noqa: E402
from ticket.models.models import ISSUESType, Note, Ticket, TicketComment  # noqa: E402
from ticket.utils import BUILD  # noqa: E402
from users.models.models import Department, UserInfo  # noqa: E402

random.seed(20260727)

SUBJECTS = [
    "الجهاز لا يقلع بعد انقطاع الكهرباء صباح اليوم.",
    "طابعة الاستقبال تظهر خطأ ورق محشور رغم عدم وجود ورق.",
    "بطء شديد في فتح الأنظمة بالطابق الثاني منذ الصباح.",
    "موظف جديد يحتاج حساباً على نظام السجلات الطبية.",
    "لا يمكن رفع صور الأشعة إلى النظام المركزي.",
    "الشاشة في غرفة 204 تومض بشكل متقطع.",
    "المستخدم لا يستطيع الدخول بعد عدة محاولات فاشلة.",
    "مطلوب تثبيت برنامج إدارة المختبر على ثلاثة أجهزة.",
    "جهاز البصمة عند المدخل الرئيسي لا يسجل الحضور.",
    "لا يوجد اتصال بالإنترنت في العيادات الخارجية.",
    "الرسائل الصادرة تبقى في صندوق المسودات.",
    "صيانة وقائية دورية لأجهزة القسم.",
]

ISSUE_TYPES = [
    "عطل في الأجهزة", "مشكلة برمجية", "مشكلة شبكة",
    "طلب صلاحية", "صيانة دورية", "تركيب برنامج",
]

AGENT_COMMENTS = [
    "تم استلام الطلب وسنبدأ الفحص خلال ساعة.",
    "قمنا بزيارة الموقع وجارٍ تشخيص المشكلة.",
    "نحتاج قطعة غيار وتم طلبها من المخزن.",
    "تم الحل، برجاء التأكيد من طرفكم.",
]

PATIENTS = [
    ("أحمد محمد علي", "د. سامي عبد الرحمن"),
    ("فاطمة حسن إبراهيم", "د. منى الشريف"),
    ("محمود سعيد يوسف", "د. خالد النجار"),
    ("نورهان عادل فتحي", "د. هالة رشدي"),
    ("عمر طارق منصور", "د. سامي عبد الرحمن"),
    ("سارة وليد أنور", "د. منى الشريف"),
    ("يوسف كريم عبد الله", "د. خالد النجار"),
    ("مريم أشرف زكي", "د. هالة رشدي"),
]

PR_QUESTIONS = [
    ("هل كان الطبيب واضحاً في شرح حالتك؟", QuestionType.RATE, QuestionCategory.DOCTOR, QuestionWeight.HIGH),
    ("هل تم فحصك في وقت مناسب؟", QuestionType.RATE, QuestionCategory.DOCTOR, QuestionWeight.MEDIUM),
    ("هل استجاب فريق التمريض بسرعة؟", QuestionType.RATE, QuestionCategory.NURSING, QuestionWeight.HIGH),
    ("هل كان تعامل التمريض محترماً؟", QuestionType.RATE, QuestionCategory.NURSING, QuestionWeight.MEDIUM),
    ("هل كانت الغرفة نظيفة؟", QuestionType.RATE, QuestionCategory.CARE, QuestionWeight.MEDIUM),
    ("هل كانت وجبات الطعام مناسبة؟", QuestionType.RATE, QuestionCategory.KITCHEN, QuestionWeight.LOW),
    ("هل شعرت بالأمان داخل المستشفى؟", QuestionType.RATE, QuestionCategory.SECURITY, QuestionWeight.LOW),
    ("هل كانت إجراءات الدخول سلسة؟", QuestionType.RATE, QuestionCategory.RESEPTIONIST, QuestionWeight.LOW),
    ("هل توصي بالمستشفى لأقاربك؟", QuestionType.YES_NO, QuestionCategory.RECOMMENDATION, QuestionWeight.HIGH),
]


def clear_demo():
    TicketComment.objects.all().delete()
    Note.objects.all().delete()
    Ticket.objects.all_with_deleted().delete() if hasattr(Ticket.objects, "all_with_deleted") else Ticket.objects.all().delete()
    ISSUESType.objects.all().delete()
    Survey.objects.all().delete()
    SurveyAnswer.objects.all().delete()
    SurveyInfo.objects.all().delete()
    SurveyQuestion.objects.all().delete()
    SurveyTemplate.objects.all().delete()


def main():
    print("🎬 Seeding DEMO data for the production system (local only)...")
    clear_demo()

    users = list(UserInfo.objects.all())
    if not users:
        print("❌ No users — run the local seed script first.")
        sys.exit(1)

    receiver_depts = list(Department.objects.filter(reciever=True))
    if not receiver_depts:
        print("❌ No receiver department found.")
        sys.exit(1)
    dept = receiver_depts[0]

    # ---- issue types (resolution taxonomy, per receiving department)
    issue_types = [ISSUESType.objects.create(department=dept, name=n) for n in ISSUE_TYPES]
    print(f"  issue types : {len(issue_types)}")

    # ---- tickets
    distribution = (
        [TicketStatus.ON_HOLD] * 7
        + [TicketStatus.IN_PROGRESS] * 9
        + [TicketStatus.COMPLETE] * 10
        + [TicketStatus.CLOSED] * 14
    )
    made = comments = 0
    for i, status in enumerate(distribution):
        building = random.choice(list(BUILD.keys()))
        floor = random.choice(BUILD[building])
        reporter = random.choice(users)
        needs_type = status in (TicketStatus.COMPLETE, TicketStatus.CLOSED)

        t = Ticket(
            complaint=reporter,
            department=dept,
            building=building,
            floor=floor,
            description=SUBJECTS[i % len(SUBJECTS)],
            status=status,
            extension=random.randint(1000, 9999),
            phone=f"+2010{random.randint(10000000, 99999999)}",
            is_external=random.random() < 0.15,
            issuetype=random.choice(issue_types) if needs_type else None,
        )
        # bypass the signal-driven workflow: we set the final state directly
        t.save()

        created = timezone.now() - timedelta(days=random.randint(0, 45), hours=random.randint(0, 23))
        closed = created + timedelta(hours=random.randint(2, 96)) if needs_type else None
        Ticket.objects.filter(pk=t.pk).update(created_at=created, closed_at=closed, status=status)
        made += 1

        # TicketComment.clean() only allows a commenter who belongs to the ticket's
        # department or to the reporter's department — pick from that pool only.
        commenters = [
            u for u in users
            if u.department_id in (dept.id, reporter.department_id) and u.department_id is not None
        ]
        for _ in range(random.randint(1, 3)):
            if not commenters:
                break
            TicketComment.objects.create(
                ticket=t, commenter=random.choice(commenters), comment=random.choice(AGENT_COMMENTS)
            )
            comments += 1
    print(f"  tickets     : {made} (with {comments} comments)")

    # ---- internal notes / announcements
    notes = [
        "تذكير: الصيانة الدورية للخوادم يوم الخميس بعد الخامسة مساءً.",
        "تم تحديث دليل استخدام نظام السجلات الطبية.",
        "برجاء إغلاق التذاكر المكتملة أولاً بأول لتحسين مؤشرات القسم.",
    ]
    for body in notes:
        Note.objects.create(poster=random.choice(users), department=dept, note=body)
    print(f"  notes       : {len(notes)}")

    # ---- PR: templates + questions
    tpl_in = SurveyTemplate.objects.create(title="المرضى الداخليون", flag=False, order=1)
    tpl_out = SurveyTemplate.objects.create(title="العيادات الخارجية", flag=True, order=2)
    q_objs = []
    for order, (text, group, category, weight) in enumerate(PR_QUESTIONS, start=1):
        for tpl in (tpl_in, tpl_out):
            q_objs.append(
                SurveyQuestion.objects.create(
                    template=tpl, question=text, group=group,
                    category=category, periority=weight, order=order,
                )
            )
    print(f"  pr questions: {len(q_objs)} (2 templates)")

    # ---- PR: surveys with answers
    surveys = 0
    for i in range(40):
        patient, doctor = PATIENTS[i % len(PATIENTS)]
        unhappy = random.random() < 0.3
        out_patient = random.random() < 0.45

        info = SurveyInfo.objects.create(
            room_no=random.randint(101, 520),
            admission_no=f"ADM-{100000 + i}",
            enter_date=timezone.now() - timedelta(days=random.randint(0, 60)),
            doctor=doctor,
            patient=patient,
            phone=f"+2010{random.randint(10000000, 99999999)}",
        )
        survey = Survey.objects.create(
            info=info,
            flag=out_patient,
            survey_type=random.choice([SurveyType.IN_PERSON, SurveyType.CALL]),
            satisfied=not unhappy,
            comment="الخدمة كانت ممتازة وشكراً للفريق." if not unhappy
                    else "واجهت تأخيراً في الاستجابة وأتمنى تحسين ذلك.",
        )
        for text, group, category, weight in PR_QUESTIONS:
            if group == QuestionType.YES_NO:
                answer = 0 if unhappy else 1
            else:
                answer = random.randint(1, 3) if unhappy else random.randint(4, 5)
            ans = SurveyAnswer.objects.create(
                question=text, group=group, answer=answer,
                category=category, periority=weight,
            )
            survey.answers.add(ans)
        surveys += 1
    print(f"  pr surveys  : {surveys}")

    print(f"\n✅ Demo data ready — {Ticket.objects.count()} tickets, {Survey.objects.count()} surveys.")


if __name__ == "__main__":
    main()

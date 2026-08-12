/**
 * DEMO data seed for the PR (patient satisfaction) system — LOCAL ONLY.
 *
 * Creates questions across all four categories plus a spread of surveys
 * (satisfied / unsatisfied, in-patient / out-patient, call / in-person) with
 * per-question answers, follow-up states and WhatsApp delivery logs, so the
 * dashboard, archive and analytics screens have real content.
 *
 * Run:  npm run seed-demo
 * Re-runnable: clears previous demo surveys/answers/logs first.
 *
 * ⚠️ NEVER run against a live database — it deletes survey rows.
 */
import pg from "pg";

const { Client } = pg;
const DATABASE_URL =
  process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5445/abcpr";

let s = 20260727;
const rnd = () => ((s = (s * 1103515245 + 12345) % 2147483648) / 2147483648);
const pick = (a) => a[Math.floor(rnd() * a.length)];
const int = (min, max) => min + Math.floor(rnd() * (max - min + 1));
const daysAgo = (d) => new Date(Date.now() - d * 86400000).toISOString();

const QUESTIONS = [
  ["هل كان الطبيب واضحاً في شرح حالتك؟", "Medical", "High"],
  ["هل تم فحصك في وقت مناسب؟", "Medical", "High"],
  ["هل استجاب فريق التمريض لطلباتك بسرعة؟", "Nursing", "High"],
  ["هل كان التعامل من التمريض لطيفاً ومحترماً؟", "Nursing", "Medium"],
  ["هل كانت الغرفة نظيفة ومرتبة؟", "Hospitality", "Medium"],
  ["هل كانت وجبات الطعام مناسبة؟", "Hospitality", "Low"],
  ["هل شعرت بالأمان داخل المستشفى؟", "Security", "Medium"],
  ["هل كانت إجراءات الدخول والخروج سلسة؟", "Security", "Low"],
];

const PATIENTS = [
  ["أحمد محمد علي", "د. سامي عبد الرحمن"],
  ["فاطمة حسن إبراهيم", "د. منى الشريف"],
  ["محمود سعيد يوسف", "د. خالد النجار"],
  ["نورهان عادل فتحي", "د. سامي عبد الرحمن"],
  ["عمر طارق منصور", "د. هالة رشدي"],
  ["سارة وليد أنور", "د. منى الشريف"],
  ["يوسف كريم عبد الله", "د. خالد النجار"],
  ["مريم أشرف زكي", "د. هالة رشدي"],
  ["خالد ماهر سليم", "د. سامي عبد الرحمن"],
  ["هدى ناصر جمال", "د. منى الشريف"],
  ["إبراهيم فؤاد حامد", "د. خالد النجار"],
  ["ليلى صبري مختار", "د. هالة رشدي"],
];

const REMINDERS = [
  "تم التواصل مع المريض والاعتذار، وأُحيلت الملاحظة لرئيس القسم.",
  "جارٍ مراجعة الشكوى مع فريق التمريض.",
  "تم حل المشكلة وإبلاغ المريض بالإجراء المتخذ.",
];

const client = new Client({ connectionString: DATABASE_URL });
await client.connect();

try {
  await client.query("BEGIN");

  // ---- reset demo rows (keep users/templates/categories from the boot seed)
  await client.query("DELETE FROM answers");
  await client.query("DELETE FROM whatsapp_logs");
  await client.query("DELETE FROM surveys");
  await client.query("DELETE FROM questions");

  // ---- questions (each belongs to a survey template)
  const templates = (await client.query("SELECT id, title FROM templates ORDER BY id")).rows;
  if (templates.length === 0) throw new Error("No templates found — start the app once so it seeds defaults.");
  const inPatientTpl = templates.find((t) => t.title === "In-Patient") ?? templates[0];

  const qIds = [];
  for (const [text, category, priority] of QUESTIONS) {
    const r = await client.query(
      "INSERT INTO questions (template_id, text, category, priority) VALUES ($1,$2,$3,$4) RETURNING id",
      [inPatientTpl.id, text, category, priority],
    );
    qIds.push(r.rows[0].id);
  }

  // ---- agents to attribute surveys to
  const agents = (await client.query("SELECT id, name FROM users ORDER BY id")).rows;
  if (agents.length === 0) throw new Error("No users found — start the app once so it seeds defaults.");

  let surveys = 0, answers = 0, logs = 0;

  for (let i = 0; i < 60; i++) {
    const [patient, doctor] = PATIENTS[i % PATIENTS.length];
    const agent = pick(agents);
    // ~30% unsatisfied so the "critical cases" views are populated.
    const unhappy = rnd() < 0.3;
    const clinic = rnd() < 0.55 ? "In-Patient" : "Out-Patient";
    const interview = rnd() < 0.5 ? "Call" : "In Person";
    const createdAt = daysAgo(int(0, 60));
    const phone = `2010${int(10000000, 99999999)}`;

    const sr = await client.query(
      `INSERT INTO surveys
        (agent_id, agent_name, patient_name, medical_number, room_number, phone_number,
         doctor_name, enter_date, interview_type, clinic_type, is_satisfied, recommend,
         created_at, followup_status, reminder_text)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15) RETURNING id`,
      [
        agent.id, agent.name, patient,
        `MRN-${100000 + i}`,
        clinic === "In-Patient" ? String(int(101, 520)) : "غير محدد",
        phone, doctor, createdAt, interview, clinic,
        !unhappy, unhappy ? (rnd() < 0.7 ? "No" : "Yes") : "Yes",
        createdAt,
        unhappy ? pick(["تم الحل", "قيد العمل"]) : null,
        unhappy ? pick(REMINDERS) : null,
      ],
    );
    const sid = sr.rows[0].id;
    surveys++;

    // answers: happy surveys score 4-5, unhappy 1-3
    for (const qid of qIds) {
      const score = unhappy ? int(1, 3) : int(4, 5);
      await client.query(
        "INSERT INTO answers (survey_id, question_id, score) VALUES ($1,$2,$3)",
        [sid, qid, score],
      );
      answers++;
    }

    // unsatisfied cases trigger an apology message -> log it
    if (unhappy) {
      await client.query(
        `INSERT INTO whatsapp_logs (id, phone_number, message, sent_at, medical_number, status, webhook_event, webhook_updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
        [
          `demo-${sid}-${int(1000, 9999)}`,
          phone,
          "نعتذر عن أي قصور في خدمتنا، وسيتواصل معكم فريق علاقات المرضى قريباً.",
          createdAt,
          `MRN-${100000 + i}`,
          pick(["مرسلة", "مستلمة", "تمت القراءة"]),
          "messages.update",
          createdAt,
        ],
      );
      logs++;
    }
  }

  await client.query("COMMIT");
  console.log("🎬 PR demo data seeded (local only)");
  console.log(`  questions      : ${qIds.length}`);
  console.log(`  surveys        : ${surveys}`);
  console.log(`  answers        : ${answers}`);
  console.log(`  whatsapp logs  : ${logs}`);
} catch (err) {
  await client.query("ROLLBACK");
  console.error("❌ PR demo seed failed:", err.message);
  process.exitCode = 1;
} finally {
  await client.end();
}

# تشغيل المشاريع الثلاثة محلياً

> إعداد: **خالد — NuzulTech**. كل الخدمات محلية فقط؛ لا يوجد أي نشر أو رفع.

## البنية

```
E:\Ticket System\
├── ticket-crm\         النظام الجديد   (NestJS + React 19 + Prisma)
├── abc-pr\             نظام رضا المرضى (Express + React 19 + pg)
├── abc-production\     البرودكشن       (Django + DRF + Channels / CRA)
│   ├── ticket-back\
│   └── ticket-front\
├── .local-dev\         بنية تحتية مشتركة (Postgres + Redis محمولان)
└── plans\              الخطط والتقارير
```

## المنافذ وقواعد البيانات

| الخدمة | المنفذ | قاعدة البيانات |
|--------|--------|----------------|
| PostgreSQL (مشترك) | 5445 | `abch_db` / `abcpr` / `abc` |
| Redis (مشترك) | 9396 | — |
| ticket-crm — API | 4000 | `abch_db` |
| ticket-crm — Web | 5173 | — |
| abc-pr (API+SPA معاً) | 3000 | `abcpr` |
| production — API (Django) | 8000 | `abc` |
| production — Web (CRA) | 3001 | — |

## بيانات الدخول (محلية فقط)

| النظام | المستخدم | كلمة المرور |
|--------|----------|-------------|
| ticket-crm | `admin` (أو `supervisor` / `agent` / `user`) | `Admin@123` |
| abc-pr | `admin` / `manager` / `agent` | `change-me-admin` / `change-me-manager` / `change-me-agent` |
| production | `1` (أدمن عام) · `2` (مدير) · `3` (وكيل) · `4` (استقبال) | `Admin@123` |

> تسجيل الدخول في البرودكشن يتم برقم البصمة `fingerid` (رقم صحيح) لا باسم مستخدم.

---

## 1) البنية التحتية المشتركة (تُشغَّل أولاً)

```bash
# PostgreSQL
"E:/Ticket System/.local-dev/pg/bin/pg_ctl.exe" \
  -D "E:/Ticket System/.local-dev/data" -o "-p 5445" \
  -l "E:/Ticket System/.local-dev/pg.log" start

# Redis
"E:/Ticket System/.local-dev/redis/Redis-8.8.1-Windows-x64-msys2/redis-server.exe" \
  --port 9396 --save "" --appendonly no --loglevel warning
```

## 2) ticket-crm (النظام الجديد)

```bash
cd "E:/Ticket System/ticket-crm/backend"
export $(grep -vE '^\s*#|^\s*$' ../.env | xargs -d '\n')
npm run start:dev                      # API -> :4000

cd "E:/Ticket System/ticket-crm/frontend"
npx vite --port 5173 --strictPort      # Web -> :5173
```
الإعدادات في `ticket-crm/.env` و`ticket-crm/frontend/.env.local`.
لإعادة زرع البيانات: `cd backend && npm run seed-local`.

## 3) abc-pr (نظام رضا المرضى)

```bash
cd "E:/Ticket System/abc-pr"
export $(grep -vE '^\s*#|^\s*$' .env | xargs -d '\n')
npm run dev                            # API + SPA -> :3000
```
المخطط والبذور تُطبَّق تلقائياً عند الإقلاع.
الاختبارات (على قاعدة معزولة — **لا تشغّلها على قاعدة حقيقية**):
```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5445/abcpr_test" \
JWT_SECRET="test_secret_..." npx vitest run     # 21/21 ✅
```

## 4) abc-production (البرودكشن)

```bash
# الخلفية (Django)
cd "E:/Ticket System/abc-production/ticket-back"
./.venv/Scripts/python.exe manage.py runserver 0.0.0.0:8000 \
    --settings=ABCHospital.settings_local --noreload

# الواجهة (CRA)
cd "E:/Ticket System/abc-production/ticket-front"
BROWSER=none PORT=3001 npm start
```

- `ABCHospital/settings_local.py` هو إعداد التشغيل المحلي (**`settings.py` الأصلي لم يُمَس**): يوجّه لقاعدة البيانات وRedis المحليين، ويستبدل `InMemoryChannelLayer` بـRedis، ويزيل حزمتين مهجورتين.
- إعادة إنشاء المستخدمين: شغّل سكربت البذور المحلي بنفس الإعدادات.

---

## تعديلات لازمة للتشغيل المحلي (وسبب كل منها)

| المشروع | التعديل | السبب |
|---------|---------|-------|
| abc-pr | `migrate.ts`: `__dirname` ← `import.meta.url` | المشروع ESM فكان `npm run dev` **لا يعمل إطلاقاً** |
| production | `requirements-local.txt` | `psycopg2` المصدري لا يُبنى على ويندوز؛ و`channels==3.0.0` يتعارض مع daphne 4 |
| production | `+ twilio` | مستورد في `helpers.py:9` (وإن كان غير مستخدم) فيلزم لتحميل الوحدة |
| production | `ticket/apis/urls.py`: `basename` صريح | تعارض تسجيل DRF (`ticket`/`restore` و`exports`/`imports` يتشاركان الموديل) |
| production | `ticket-front/package.json`: `node-sass` ← `sass` | `node-sass 8` لا يُبنى على Node 24 |
| production | إعادة توليد `package-lock.json` | القديم يحوي اسم حزمة بأحرف كبيرة لم يعد npm يقبله (النسخة القديمة محفوظة `.bak`) |
| production | `+ ajv@8` | تعارض `ajv-keywords` المعروف في CRA 5 |
| production | `crudApi.js` / `socket.js`: عناوين من متغيرات بيئة | كانت مضمّنة في الكود لنطاق آخر (`support.csch-svu.com`) |

## إصلاح أمني مُطبَّق ومُتحقَّق منه

**`pr/permissions.py` — تسريب بيانات مرضى (PHI):** كان الشرط `if not role == ADMIN: return True` مقلوباً، فيمنح **أي مستخدم غير أدمن** قراءة استبيانات المرضى بغض النظر عن قسمه أو صلاحياته، ويمنع الأدمن.

تحقّق عملي بعد الإصلاح:

| المستخدم | قبل | بعد |
|----------|-----|-----|
| أدمن عام (بلا قسم) | ❌ 403 | ✅ 200 |
| وكيل في قسم يملك وحدة PR | ✅ 200 | ✅ 200 |
| مستخدم في قسم **لا** يملك PR | 🔴 **200 (تسريب)** | ✅ **403** |

> هذا الإصلاح مُطبَّق على **النسخة المحلية فقط**. النظام الحيّ على السيرفر **لا يزال مصاباً** — راجع `plans/خطة-التطوير-الموحدة.md` (المرحلة A0).

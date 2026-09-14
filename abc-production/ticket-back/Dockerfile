FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /app

# تثبيت الاعتماديات البرمجية الضرورية لمكتبات psycopg2 و pillow والأدوات الأساسية
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        build-essential \
        libpq-dev \
        libjpeg-dev \
        zlib1g-dev \
        curl \
    && rm -rf /var/lib/apt/lists/*

# نسخ وتثبيت متطلبات بايثون مع daphne لتشغيل ASGI و WebSockets
COPY requirements.txt ./
RUN pip install --upgrade pip && \
    pip install -r requirements.txt && \
    pip install daphne

# نسخ كامل كود الباك إند
COPY . .

EXPOSE 8000

# تشغيل تجميع الملفات الثابتة ثم خادم Daphne على المنفذ 8000
CMD ["sh", "-c", "python manage.py collectstatic --noinput && daphne -b 0.0.0.0 -p 8000 ABCHospital.asgi:application"]

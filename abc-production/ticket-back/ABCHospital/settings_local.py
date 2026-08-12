"""
Local development settings for running the ABC production backend on a dev machine.
(NuzulTech) — the original `settings.py` is deliberately left untouched.

Run with:
    python manage.py <cmd> --settings=ABCHospital.settings_local

What this overrides and why:
  * DATABASES / CACHES  — production hardcodes LOCAL_IP = '10.10.1.40' for both
                          PostgreSQL and Redis, which does not exist locally.
  * CHANNEL_LAYERS      — production uses InMemoryChannelLayer, which silently
                          drops cross-process group sends. Redis is used here so
                          WebSocket behaviour matches a real deployment.
  * INSTALLED_APPS      — drops `rest_framework_swagger` (abandoned since 2018,
                          incompatible with DRF/Django 5; `drf_yasg` is the one
                          actually used) and `django_async_orm` (unused, does not
                          install cleanly on modern Python).
  * MIDDLEWARE          — drops UpdateCacheMiddleware, which production installs
                          WITHOUT its mandatory pair FetchFromCacheMiddleware, so
                          responses are written to Redis and never read back.
"""
from .settings import *  # noqa: F401,F403

DEBUG = True
ALLOWED_HOSTS = ["*"]

# --- Local portable PostgreSQL (see .local-dev) -----------------------------
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": "abc",
        "USER": "postgres",
        "PASSWORD": "postgres",
        "HOST": "127.0.0.1",
        "PORT": "5445",
    }
}

# --- Local portable Redis ---------------------------------------------------
REDIS_URL_LOCAL = "redis://127.0.0.1:9396"

CACHES = {
    "default": {
        "BACKEND": "django_redis.cache.RedisCache",
        "LOCATION": REDIS_URL_LOCAL,
        "OPTIONS": {"CLIENT_CLASS": "django_redis.client.DefaultClient"},
    }
}

CHANNEL_LAYERS = {
    "default": {
        "BACKEND": "channels_redis.core.RedisChannelLayer",
        "CONFIG": {"hosts": [("127.0.0.1", 9396)]},
    }
}

# --- Trim apps/middleware that cannot run locally ---------------------------
INSTALLED_APPS = [
    app for app in INSTALLED_APPS  # noqa: F405
    if app not in ("rest_framework_swagger", "django_async_orm")
]

# Channels 4 only takes over `runserver` with an ASGI/WebSocket-capable server when
# `daphne` is the FIRST installed app. Without it runserver stays WSGI-only, so
# `ws://.../ws/` fails to connect and all real-time features are dead in local dev.
if "daphne" not in INSTALLED_APPS:
    INSTALLED_APPS = ["daphne"] + INSTALLED_APPS

MIDDLEWARE = [
    mw for mw in MIDDLEWARE  # noqa: F405
    if mw != "django.middleware.cache.UpdateCacheMiddleware"
]

CORS_ORIGIN_ALLOW_ALL = True

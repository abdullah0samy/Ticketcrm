"""
Settings for the standalone ABC Hospital PR service.

This project is the `pr` app extracted out of the ABCHospital ticketing monolith
so it can be deployed and scaled on its own path/port.

Design notes:
  * The `users` app is included ONLY so the service can authenticate. Its models map
    to the SAME tables as the monolith (`users_userinfo`, `users_department`), so
    existing DRF tokens keep working unchanged — this is the first step of a
    strangler-fig split, not a data migration.
  * Nothing here imports from `ticket`, `dashboard`, or `ABCHospital`.
  * Unlike the monolith, every secret is read from the environment. There are no
    hardcoded credentials in this file.
"""
import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent


def env(name, default=None, required=False):
    value = os.environ.get(name, default)
    if required and not value:
        raise RuntimeError(f"Missing required environment variable: {name}")
    return value


# --- Security ---------------------------------------------------------------
SECRET_KEY = env("PR_SECRET_KEY", "dev-only-insecure-key-change-me")
DEBUG = env("PR_DEBUG", "true").lower() == "true"
ALLOWED_HOSTS = [h.strip() for h in env("PR_ALLOWED_HOSTS", "*").split(",") if h.strip()]

# --- Applications -----------------------------------------------------------
INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",

    # local
    "users",   # authentication only (shares the monolith's user tables)
    "pr",

    # third party
    "corsheaders",
    "rest_framework",
    "rest_framework.authtoken",
    "django_filters",
    "django_better_admin_arrayfield",
    "solo",
    "adminsortable2",
    "drf_yasg",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "prcore.urls"
WSGI_APPLICATION = "prcore.wsgi.application"
ASGI_APPLICATION = "prcore.asgi.application"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

# --- Database ---------------------------------------------------------------
# Points at the same database as the monolith by default (shared-DB phase).
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": env("PR_DB_NAME", "abc"),
        "USER": env("PR_DB_USER", "postgres"),
        "PASSWORD": env("PR_DB_PASSWORD", "postgres"),
        "HOST": env("PR_DB_HOST", "127.0.0.1"),
        "PORT": env("PR_DB_PORT", "5445"),
    }
}

AUTH_USER_MODEL = "users.UserInfo"

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

# --- DRF --------------------------------------------------------------------
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": ("rest_framework.authentication.TokenAuthentication",),
    "DEFAULT_PERMISSION_CLASSES": ("rest_framework.permissions.IsAuthenticated",),
    "DEFAULT_THROTTLE_CLASSES": [
        "rest_framework.throttling.AnonRateThrottle",
        "rest_framework.throttling.UserRateThrottle",
    ],
    "DEFAULT_THROTTLE_RATES": {"anon": "60/minute", "user": "200/minute"},
    "EXCEPTION_HANDLER": "prcore.exceptions.custom_exception_handler",
    "DEFAULT_PAGINATION_CLASS": "prcore.paginators.GeneralPagination",
    "DEFAULT_FILTER_BACKENDS": ["django_filters.rest_framework.DjangoFilterBackend"],
}

SWAGGER_SETTINGS = {
    "SECURITY_DEFINITIONS": {
        "token": {"type": "apiKey", "name": "Authorization", "in": "header"},
    }
}

# --- CORS -------------------------------------------------------------------
_cors = env("PR_CORS_ORIGINS", "")
if _cors:
    CORS_ALLOWED_ORIGINS = [o.strip() for o in _cors.split(",") if o.strip()]
else:
    # Dev default only. Set PR_CORS_ORIGINS in any deployed environment.
    CORS_ORIGIN_ALLOW_ALL = DEBUG

# --- i18n / tz --------------------------------------------------------------
LANGUAGE_CODE = "ar"
TIME_ZONE = "Africa/Cairo"
USE_I18N = True
USE_TZ = True

LANGUAGES = [("ar", "Arabic"), ("en", "English")]

# --- Static / media ---------------------------------------------------------
STATIC_URL = "static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
MEDIA_URL = "media/"
MEDIA_ROOT = BASE_DIR / "media"

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# --- Integrations -----------------------------------------------------------
# Empty by default -> the WhatsApp sender is a no-op (matches production, where the
# survey-invite signal is commented out).
WHATSAPP_API_URL = env("PR_WHATSAPP_API_URL", "")

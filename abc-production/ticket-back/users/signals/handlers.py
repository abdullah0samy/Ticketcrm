from rest_framework.authtoken.models import Token


def postsave_user_handler(data):
    instance = data["instance"]
    created = data["created"]
    if created:
        Token.objects.get_or_create(user=instance)

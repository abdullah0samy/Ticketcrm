from users.models.choices import AllowedModules

# A user with no department is treated as a global admin. The API represents that
# with this synthetic department instead of `null`, because clients read
# `department.modules` unconditionally.
ADMIN_DEPARTMENT = {
    "id": 0,
    "name": "Administration",
    "reciever": False,
    "modules": AllowedModules.values,
}

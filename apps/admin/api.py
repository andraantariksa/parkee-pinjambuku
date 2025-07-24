from ninja import Router
from django.contrib.auth import authenticate, login
from django.http import HttpRequest

from apps.admin.schema import AdminLoginIn


router = Router()


@router.post("/admin/login", response={200: None, 400: None})
def admin_login(request: HttpRequest, data: AdminLoginIn):
    user = authenticate(request, email=data.email, password=data.password)
    if user and user.is_staff:
        login(request, user)
        return 200, None

    return 400, None

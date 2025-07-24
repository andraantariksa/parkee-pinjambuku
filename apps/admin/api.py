from ninja import Router
from django.contrib.auth import authenticate, login
from django.http import HttpRequest
from ninja.security import django_auth

from apps.books.models import Book
from apps.admin.schema import AdminLoginIn, AdminCreateBook


router = Router()


@router.post("/admin/login", response={200: None, 400: None})
def admin_login(request: HttpRequest, data: AdminLoginIn):
    user = authenticate(request, email=data.email, password=data.password)
    if user and user.is_staff:
        login(request, user)
        return 200, None

    return 400, None


@router.post("/admin/books", response={201: None}, auth=django_auth)
def books_create(request: HttpRequest, data: AdminCreateBook):
    # Convert schema to dict and create Book instance
    book_data = data.dict()
    book = Book(**book_data)
    book.save()
    return 201, None

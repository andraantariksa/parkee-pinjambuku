from ninja import Router
from django.contrib.auth import authenticate, login
from django.http import HttpRequest
from ninja.security import django_auth

from apps.books.models import Book, BookStock
from apps.admin.schema import AdminLoginIn, AdminCreateBook


router = Router()


@router.post("/admin/login", response={200: None, 400: None})
def admin_login(request: HttpRequest, data: AdminLoginIn):
    user = authenticate(request, email=data.email, password=data.password)
    if user and user.is_staff:
        login(request, user)
        return 200, None

    return 400, None


@router.post("/admin/books", response={201: None, 400: None}, auth=django_auth)
def books_create(request: HttpRequest, data: AdminCreateBook):
    if not request.user.is_staff:
        return 400, None

    book = Book.objects.create(title=data.title, isbn=data.isbn)
    BookStock.objects.create(book=book, stock=data.stock_quantity)
    return 201, None

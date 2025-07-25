from typing import Any
from ninja import Router
from django.db.models import Q
from django.utils import timezone
from django.contrib.auth import authenticate, login
from django.http import HttpRequest
from ninja.security import django_auth

from apps.books.models import Book, BookStock
from apps.administrator.schema import (
    AdminLoginIn,
    AdminCreateBook,
    BookTransactionsSchema,
)
from apps.borrows.models import BookBorrowTransaction


router = Router()


@router.post("/admin/login", response={200: None, 400: None})
def admin_login(request: HttpRequest, data: AdminLoginIn) -> tuple[int, None]:
    user = authenticate(request, email=data.email, password=data.password)
    if user and user.is_staff:
        login(request, user)
        return 200, None

    return 400, None


@router.post("/admin/books", response={201: None, 400: None}, auth=django_auth)
def books_create(request: HttpRequest, data: AdminCreateBook) -> tuple[int, None]:
    if not request.user.is_staff:
        return 400, None

    book = Book.objects.create(title=data.title, isbn=data.isbn)
    BookStock.objects.create(book=book, quantity=data.stock_quantity)
    return 201, None


@router.get(
    "/admin/transactions",
    response={200: BookTransactionsSchema, 400: None},
    auth=django_auth,
)
def books_transactions(request: HttpRequest) -> tuple[int, dict[str, Any] | None]:
    if not request.user.is_staff:
        return 400, None

    from django.db.models import F

    today = timezone.localdate()
    transactions = BookBorrowTransaction.objects.annotate(
        is_late=(
            (Q(return_date__isnull=True) & Q(return_scheduled_date__lt=today))
            | (
                Q(return_date__isnull=False)
                & Q(return_date__gt=F("return_scheduled_date"))
            )
        )
    ).order_by("-id")
    return 200, {"transactions": transactions}

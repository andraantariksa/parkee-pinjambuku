from django.http import HttpRequest
from django.db.models import F
from django.shortcuts import get_object_or_404

from ninja import Router
from ninja.security import django_auth

from django.utils import timezone
from datetime import timedelta

from apps.borrows.models import BookBorrowTransaction
from apps.borrows.schema import (
    BorrowerDetailsSchema,
    BorrowRequestSchema,
    ReturnRequestSchema,
    BorrowersSchema,
)
from apps.books.models import BookStock, Book
from apps.users.models import User


router = Router()


@router.post(
    "borrowers/{id_card_number}",
    response={200: BorrowerDetailsSchema},
)
def borrowers_details(request: HttpRequest, id_card_number: str, data: BorrowersSchema):
    user = get_object_or_404(User, id_card_number=id_card_number, email=data.email)
    return BorrowerDetailsSchema(
        borrow_transactions=BookBorrowTransaction.objects.filter(borrower=user),
    )


@router.post(
    "borrowers/{id_card_number}/borrow",
    response={200: None, 400: dict},
)
def borrow_book(request: HttpRequest, id_card_number: str, data: BorrowRequestSchema):
    user = get_object_or_404(User, id_card_number=id_card_number, email=data.email)
    book = get_object_or_404(Book, id=data.book_id)

    book_stock, _ = BookStock.objects.get_or_create(book=book)
    if book_stock.quantity < 1:
        return 400, {"detail": "Book is out of stock" }

    has_active_loan = BookBorrowTransaction.objects.filter(
        borrower=user, return_date__isnull=True
    ).exists()
    if has_active_loan:
        return 400, { "detail": "You have an active loan and cannot borrow another book" }

    if data.return_scheduled_date < timezone.localdate():
        return 400, { "detail": "You cant set return date in the past" }

    MAX_LOAN_DURATION = timedelta(days=30)
    if data.return_scheduled_date > timezone.localdate() + MAX_LOAN_DURATION:
        return 400, { "detail": "Loan duration cannot be longer than 30 days" }

    BookBorrowTransaction.objects.create(
        book=book,
        borrower=user,
        return_scheduled_date=data.return_scheduled_date,
    )

    book_stock.quantity = F("quantity") - 1
    book_stock.save()

    return 200, None


@router.post(
    "borrowers/{id_card_number}/return",
    response={200: None, 400: dict},
)
def return_book(request: HttpRequest, id_card_number: str, data: ReturnRequestSchema):
    user = get_object_or_404(User, id_card_number=id_card_number, email=data.email)
    book = get_object_or_404(Book, id=data.book_id)

    borrow_transaction = BookBorrowTransaction.objects.filter(
        borrower=user,
        book=book,
        return_date__isnull=True,
    ).first()
    if not borrow_transaction:
        return 400, {"detail": "No active borrow transaction found for this book and user"}

    borrow_transaction.return_date = timezone.localdate()
    borrow_transaction.save()

    book_stock: BookStock = book.stock
    book_stock.quantity = F("quantity") + 1
    book_stock.save(update_fields=["quantity"])

    return 200, None

from django.http import HttpRequest
from django.shortcuts import get_object_or_404

from ninja import Router
from ninja.security import django_auth

from apps.borrows.models import BookBorrowTransaction
from apps.borrows.schema import BorrowerDetailsSchema
from apps.users.models import User


router = Router()


@router.get(
    "borrowers/{id_card_number}",
    response={200: BorrowerDetailsSchema},
    auth=django_auth,
)
def borrowers_details(request: HttpRequest, id_card_number: str):
    user = get_object_or_404(User, id_card_number=id_card_number)
    return BorrowerDetailsSchema(
        borrow_transactions=BookBorrowTransaction.objects.filter(borrower=user),
    )

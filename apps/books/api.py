from django.http import HttpRequest
from ninja import Router

from apps.books.models import Book
from apps.books.schemas import BookSchema


router = Router()


@router.get("books/", response={200: list[BookSchema]})
def list_books(request: HttpRequest) -> list[Book]:
    return Book.objects.all()

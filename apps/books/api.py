from ninja import Router

from apps.books.models import Book
from apps.books.schemas import BookSchema


router = Router()


@router.get("/", response={200: list[BookSchema]})
def list_books(request):
    books = Book.objects.all()
    return books

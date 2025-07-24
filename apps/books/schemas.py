from ninja import ModelSchema

from apps.books.models import Book


class BookSchema(ModelSchema):
    class Meta:
        model = Book
        fields = ["id", "title", "isbn"]

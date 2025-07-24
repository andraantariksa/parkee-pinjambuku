from ninja import Schema, ModelSchema

from apps.books.models import Book


class AdminLoginIn(Schema):
    email: str
    password: str


class AdminCreateBook(ModelSchema):
    class Meta:
        model = Book
        fields = ["title", "isbn"]

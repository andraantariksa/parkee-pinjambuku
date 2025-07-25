from ninja import Schema, ModelSchema, Field

from apps.books.models import Book
from apps.borrows.models import BookBorrowTransaction


class AdminLoginIn(Schema):
    email: str
    password: str


class AdminCreateBook(ModelSchema):
    stock_quantity: int

    class Meta:
        model = Book
        fields = ["title", "isbn"]


class BookTransactionSchema(ModelSchema):
    is_late: bool = Field(default=False)

    class Meta:
        model = BookBorrowTransaction
        fields = [
            "id",
            "book",
            "created_at",
            "updated_at",
            "return_date",
            "return_scheduled_date",
        ]


class BookTransactionsSchema(Schema):
    transactions: list[BookTransactionSchema]

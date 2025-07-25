from datetime import date, datetime
from ninja import Schema
from apps.books.schemas import BookSchema


class BookBorrowTransactionSchema(Schema):
    id: int
    return_date: date | None
    return_scheduled_date: date
    created_at: datetime
    book: BookSchema


class BorrowerDetailsSchema(Schema):
    borrow_transactions: list[BookBorrowTransactionSchema]


class BorrowRequestSchema(Schema):
    book_id: int
    email: str
    return_scheduled_date: date


class ReturnRequestSchema(Schema):
    book_id: int
    email: str

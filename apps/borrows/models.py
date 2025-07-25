from django.db import models

from apps.common.models import TimestampedModel


class BookBorrowTransaction(TimestampedModel):
    book = models.ForeignKey(
        "books.Book", on_delete=models.CASCADE, related_name="borrow_transactions"
    )
    borrower = models.ForeignKey(
        "users.User", on_delete=models.CASCADE, related_name="borrow_transactions"
    )
    return_scheduled_date = models.DateField()
    return_date = models.DateField(null=True, blank=True)

    class Meta:
        db_table = "book_borrow_transactions"

    def __str__(self):
        return f"{self.borrower.username} borrowed {self.book.title}: {self.created_at} - {self.return_date}"

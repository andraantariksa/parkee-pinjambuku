from django.db import models


class BookBorrowTransaction(models.Model):
    book = models.ForeignKey(
        "books.Book", on_delete=models.CASCADE, related_name="borrow_transactions"
    )
    borrower = models.ForeignKey(
        "users.User", on_delete=models.CASCADE, related_name="borrow_transactions"
    )
    return_date = models.DateField(db_index=True)

    class Meta:
        verbose_name = "book_borrow_transactions"

    def __str__(self):
        return f"{self.user.username} borrowed {self.book.title}: {self.created} - {self.return_date}"

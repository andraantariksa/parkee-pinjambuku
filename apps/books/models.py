from django.db import models

from apps.common.models import TimestampedModel


class Book(TimestampedModel):
    title = models.CharField(max_length=255)
    isbn = models.CharField(max_length=20, db_index=True)

    class Meta:
        db_table = "book"
        indexes = [
            models.Index(models.functions.Lower("title"), name="idx_book_title_lower"),
            models.Index(fields=["isbn"], name="idx_book_isbn"),
        ]

    def __str__(self):
        return f"{self.title} ({self.isbn})"


class BookStock(models.Model):
    book = models.OneToOneField(
        Book, on_delete=models.CASCADE, primary_key=True, related_name="stock"
    )
    quantity = models.PositiveIntegerField(default=0)

    class Meta:
        db_table = "book_stock"

    def __str__(self):
        return f"{self.book.title} - Stock: {self.quantity}"

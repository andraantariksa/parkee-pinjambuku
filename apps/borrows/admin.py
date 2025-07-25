from django.contrib import admin
from .models import BookBorrowTransaction


@admin.register(BookBorrowTransaction)
class BookBorrowTransactionAdmin(admin.ModelAdmin):
    list_display = (
        "borrower__name",
        "book",
        "created_at",
        "return_date",
        "return_scheduled_date",
    )
    search_fields = ("borrower__name", "book__title")
    list_filter = ("created_at", "return_date", "return_scheduled_date")

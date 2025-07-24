from django.contrib import admin
from .models import Book, BookStock


class BookStockInline(admin.TabularInline):
    model = BookStock


@admin.register(Book)
class BookAdmin(admin.ModelAdmin):
    list_display = ("title", "isbn")
    search_fields = ("title", "isbn")
    inlines = [BookStockInline]

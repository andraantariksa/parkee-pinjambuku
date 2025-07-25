from json import loads
from django.test import TestCase

from ninja.testing import TestClient

from apps.books.models import Book
from apps.books.api import router


class BooksTestCase(TestCase):
    def setUp(self):
        self.client = TestClient(router)

    def test_list_books(self):
        Book.objects.create(
            title="Book 1",
            isbn="111",
        )

        response = self.client.get("books/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            loads(response.content),
            [{"id": 1, "isbn": "111", "title": "Book 1"}],
        )

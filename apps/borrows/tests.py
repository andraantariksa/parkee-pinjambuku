from freezegun import freeze_time

from django.test import TestCase

from apps.books.models import Book
from apps.borrows.api import router
from apps.users.models import User
from tests.utils import SessionTestClient


class BorrowsTestCase(TestCase):
    def setUp(self):
        self.client = SessionTestClient(router)

    @freeze_time("2023-12-15")
    def test_list_transactions(self) -> None:
        user_1 = User.objects.create(email="andra@gmail.com", name="Andra")
        user_1.set_password("123")
        user_1.save(update_fields=["password"])
        book_1 = Book.objects.create(
            title="Book 1",
            isbn="111",
        )
        user_1.borrow_transactions.create(
            book=book_1, return_scheduled_date="2023-12-31"
        )

        user_2 = User.objects.create(email="joko@gmail.com", name="Joko")
        book_2 = Book.objects.create(
            title="Book 2",
            isbn="222",
        )
        user_2.borrow_transactions.create(
            book=book_2,
            return_scheduled_date="2023-12-31",
            created_at="2023-12-11T00:00:00Z",
        )

        book_3 = Book.objects.create(
            title="Book 3",
            isbn="333",
        )
        user_1.borrow_transactions.create(
            book=book_3,
            return_scheduled_date="2023-12-30",
            return_date="2023-12-10",
            created_at="2023-12-01T00:00:00Z",
        )

        response = self.client.get("borrowers/123")
        self.assertEqual(response.status_code, 401)

        self.client.session["_auth_user_id"] = user_1.id

        response = self.client.get("borrowers/123")
        self.assertEqual(response.status_code, 404)

        response = self.client.get(f"borrowers/{user_1.id_card_number}")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.json(),
            {
                "borrow_transactions": [
                    {
                        "id": 1,
                        "book": {
                            "id": 1,
                            "isbn": "111",
                            "title": "Book 1",
                        },
                        "created_at": "2023-12-15T00:00:00Z",
                        "return_date": None,
                        "return_scheduled_date": "2023-12-31",
                    },
                    {
                        "book": {"id": 3, "isbn": "333", "title": "Book 3"},
                        "created_at": "2023-12-15T00:00:00Z",
                        "id": 3,
                        "return_date": "2023-12-10",
                        "return_scheduled_date": "2023-12-30",
                    },
                ],
            },
        )

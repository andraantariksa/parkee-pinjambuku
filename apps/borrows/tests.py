from freezegun import freeze_time

from django.test import TestCase
from django.utils import timezone
from datetime import date, timedelta

from apps.borrows.api import router
from apps.books.models import Book, BookStock
from apps.users.models import User
from apps.borrows.models import BookBorrowTransaction
from tests.utils import SessionTestClient


class BorrowsTestCase(TestCase):
    def setUp(self):
        self.client = SessionTestClient(router)
        self.user = User.objects.create(
            id_card_number="123", email="test@example.com", name="Test User"
        )
        self.book = Book.objects.create(
            title="Book 1",
            isbn="111",
        )
        self.book_stock = BookStock.objects.create(book=self.book, quantity=2)

    def test_borrow_book_success(self):
        response = self.client.post(
            f"borrowers/{self.user.id_card_number}/borrow",
            json={
                "book_id": self.book.id,
                "return_scheduled_date": (
                    timezone.localdate() + timedelta(days=10)
                ).isoformat(),
                "email": self.user.email,
            },
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), "Book borrowed successfully")

        book_stock = BookStock.objects.get(book=self.book)
        self.assertEqual(book_stock.quantity, 1)

        borrow_tx = BookBorrowTransaction.objects.filter(
            borrower=self.user, book=self.book, return_date__isnull=True
        ).first()
        self.assertIsNotNone(borrow_tx)

    def test_borrow_book_out_of_stock(self):
        self.book_stock.quantity = 0
        self.book_stock.save(update_fields=["quantity"])

        response = self.client.post(
            f"borrowers/{self.user.id_card_number}/borrow",
            json={
                "book_id": self.book.id,
                "return_scheduled_date": (
                    timezone.localdate() + timedelta(days=10)
                ).isoformat(),
                "email": self.user.email,
            },
        )
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.json(), "Book is out of stock")

        self.book_stock.refresh_from_db()
        self.assertEqual(self.book_stock.quantity, 0)

    def test_borrow_book_with_active_loan(self):
        BookBorrowTransaction.objects.create(
            book=self.book,
            borrower=self.user,
            return_scheduled_date=timezone.localdate() + timedelta(days=10),
        )
        response = self.client.post(
            f"borrowers/{self.user.id_card_number}/borrow",
            json={
                "book_id": self.book.id,
                "return_scheduled_date": (
                    timezone.localdate() + timedelta(days=10)
                ).isoformat(),
                "email": self.user.email,
            },
        )
        self.assertEqual(response.status_code, 400)
        self.assertEqual(
            response.json(), "You have an active loan and cannot borrow another book"
        )

    def test_borrow_book_duration_too_long(self):
        response = self.client.post(
            f"borrowers/{self.user.id_card_number}/borrow",
            json={
                "book_id": self.book.id,
                "return_scheduled_date": (
                    timezone.localdate() + timedelta(days=40)
                ).isoformat(),
                "email": self.user.email,
            },
        )
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.json(), "Loan duration cannot be longer than 30 days")

    @freeze_time("2025-07-25")
    def test_return_book_success(self):
        borrow_tx = BookBorrowTransaction.objects.create(
            book=self.book,
            borrower=self.user,
            return_scheduled_date=timezone.localdate() + timedelta(days=10),
        )
        self.book_stock.quantity = 4
        self.book_stock.save()
        response = self.client.post(
            f"borrowers/{self.user.id_card_number}/return",
            json={
                "book_id": self.book.id,
                "email": self.user.email,
            },
        )
        self.assertEqual(response.status_code, 200)

        borrow_tx.refresh_from_db()
        self.assertEqual(borrow_tx.return_date, date(2025, 7, 25))

        self.book_stock.refresh_from_db()
        self.assertEqual(self.book_stock.quantity, 5)

    def test_return_book_no_active_borrow(self):
        response = self.client.post(
            f"borrowers/{self.user.id_card_number}/return",
            json={
                "book_id": self.book.id,
                "email": self.user.email,
            },
        )
        self.assertEqual(response.status_code, 400)
        self.assertEqual(
            response.json(), "No active borrow transaction found for this book and user"
        )

    @freeze_time("2023-12-15")
    def test_list_transactions(self) -> None:
        user_1 = User.objects.create(email="andra@gmail.com", name="Andra")
        user_1.set_password("123")
        user_1.save(update_fields=["password"])

        book_1 = self.book
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

        response = self.client.post("borrowers/000", json={"email": user_1.email})
        self.assertEqual(response.status_code, 401)

        self.client.session["_auth_user_id"] = user_1.id

        response = self.client.post("borrowers/000", json={"email": user_1.email})
        self.assertEqual(response.status_code, 404)

        response = self.client.post(f"borrowers/{user_1.id_card_number}", json={"email": user_1.email})
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

from django.utils import timezone
from datetime import timedelta
from django.http import HttpResponse
from django.test import TestCase


from apps.books.models import Book
from apps.administrator.api import router
from apps.borrows.models import BookBorrowTransaction
from apps.users.models import User
from tests.utils import SessionTestClient


class AdminTest(TestCase):
    def setUp(self) -> None:
        self.email = "admin@example.com"
        self.password = "123"
        self.admin_user = User.objects.create(
            name="Andra", email=self.email, is_staff=True
        )
        self.admin_user.set_password(self.password)
        self.admin_user.save()
        self.client = SessionTestClient(router)

    def login(
        self, email: str | None = None, password: str | None = None
    ) -> HttpResponse:
        login_data = {
            "email": email or self.email,
            "password": password or self.password,
        }
        return self.client.post("admin/login", json=login_data)

    def test_admin_login(self) -> None:
        response = self.login(email="wrong@email.com", password="wrongpassword")
        self.assertEqual(response.status_code, 400)

        self.admin_user.is_staff = False
        self.admin_user.save(update_fields=["is_staff"])

        response = self.login()
        self.assertEqual(response.status_code, 400)

        self.admin_user.is_staff = True
        self.admin_user.save(update_fields=["is_staff"])

        response = self.login()
        self.assertEqual(response.status_code, 200)

    def test_books_create(self) -> None:
        response = self.login()

        book_data = {"title": "Test Book", "isbn": "1234567890", "stock_quantity": 2}
        response = self.client.post("admin/books", json=book_data)
        self.assertEqual(response.status_code, 201)

        book = Book.objects.last()
        self.assertEqual(book.title, "Test Book")
        self.assertEqual(book.isbn, "1234567890")
        self.assertEqual(book.stock.quantity, 2)

    def test_books_transactions(self) -> None:
        book_1 = Book.objects.create(
            title="Book 1",
            isbn="111",
        )
        transaction_1 = BookBorrowTransaction.objects.create(
            book=book_1,
            borrower=self.admin_user,
            return_scheduled_date=timezone.localdate() - timedelta(days=1),
        )

        book_2 = Book.objects.create(
            title="Book 2",
            isbn="222",
        )
        transaction_2 = BookBorrowTransaction.objects.create(
            book=book_2,
            borrower=self.admin_user,
            return_date=timezone.localdate(),
            return_scheduled_date=timezone.localdate(),
        )
        transaction_3 = BookBorrowTransaction.objects.create(
            book=book_2,
            borrower=self.admin_user,
            return_date=timezone.localdate(),
            return_scheduled_date=timezone.localdate() + timedelta(days=2),
        )
        transaction_4 = BookBorrowTransaction.objects.create(
            book=book_2,
            borrower=self.admin_user,
            return_date=timezone.localdate(),
            return_scheduled_date=timezone.localdate() - timedelta(days=1),
        )

        self.login()
        response = self.client.get("admin/transactions")
        self.assertEqual(response.status_code, 200)
        transactions = response.json()["transactions"]

        self.assertEqual(transactions[0]["id"], transaction_4.id)
        self.assertTrue(transactions[0]["is_late"])

        self.assertEqual(transactions[1]["id"], transaction_3.id)
        self.assertFalse(transactions[1]["is_late"])

        self.assertEqual(transactions[2]["id"], transaction_2.id)
        self.assertFalse(transactions[2]["is_late"])

        self.assertEqual(transactions[3]["id"], transaction_1.id)
        self.assertTrue(transactions[3]["is_late"])

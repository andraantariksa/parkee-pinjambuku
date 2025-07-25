from typing import Any
from django.core.management.base import BaseCommand
from faker import Faker
from apps.books.models import Book
from apps.users.models import User


class Command(BaseCommand):
    help = "Create fake data for books and users"

    def handle(self, *args: Any, **kwargs: Any):
        faker = Faker()

        # Create fake users
        if not User.objects.filter(email="admin@example.com").exists():
            user = User(name="Test", email="admin@example.com", id_card_number='123')
            user.set_password("123")
            user.is_staff = True
            user.is_superuser = True
            user.is_admin = True
            user.save()

        for _ in range(5):
            email = faker.email()
            if not User.objects.filter(email=email).exists():
                user = User(name=faker.name(), email=email)
                user.set_password("123")
                user.save()
                self.stdout.write(self.style.SUCCESS(f"Created user: {email}"))

        # Create fake books
        for _ in range(10):
            title = faker.sentence(nb_words=4)
            isbn = faker.isbn13()
            Book.objects.create(title=title, isbn=isbn)
            self.stdout.write(self.style.SUCCESS(f"Created book: {title}"))

        self.stdout.write(self.style.SUCCESS("Fake data creation complete."))

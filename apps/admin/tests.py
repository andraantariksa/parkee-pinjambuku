from django.test import TestCase


from apps.admin.api import router
from apps.users.models import User
from tests.utils import SessionTestClient


class AdminTest(TestCase):
    def setUp(self) -> None:
        self.email = "admin@example.com"
        self.password = "123"
        self.admin_user = User.objects.create(name="Andra", email=self.email)
        self.admin_user.set_password(self.password)
        self.admin_user.save()
        self.client = SessionTestClient(router)

    def test_admin_login(self) -> None:
        login_data = {
            "email": "wrong@email.com",
            "password": "wrongpassword",
        }
        response = self.client.post("/admin/login", json=login_data)
        self.assertEqual(response.status_code, 400)

        login_data = {
            "email": self.email,
            "password": self.password,
        }
        response = self.client.post("/admin/login", json=login_data)
        self.assertEqual(response.status_code, 400)

        self.admin_user.is_staff = True
        self.admin_user.save(update_fields=["is_staff"])

        response = self.client.post("/admin/login", json=login_data)
        self.assertEqual(response.status_code, 200)

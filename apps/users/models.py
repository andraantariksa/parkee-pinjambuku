from django.db import models
from django.contrib.auth.models import AbstractUser
import uuid

from apps.common.models import TimestampedModel


def generate_id_card_number() -> str:
    return str(uuid.uuid4())


class User(AbstractUser, TimestampedModel):
    first_name = None
    last_name = None
    username = None

    email = models.EmailField("Email Address", unique=True)
    id_card_number = models.CharField(
        "ID Card Number", max_length=100, unique=True, default=generate_id_card_number
    )
    name = models.CharField("Name", max_length=100)

    EMAIL_FIELD = "email"
    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["name"]

    def __str__(self):
        return self.email

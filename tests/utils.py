from typing import Any
from django.contrib.messages.storage.fallback import FallbackStorage
from django.contrib.sessions.backends.db import SessionStore
from ninja.testing import TestClient


class SessionTestClient(TestClient):
    """Adds missing FallbackStorage and SessionStore to TestClient."""

    # See https://github.com/vitalik/django-ninja/issues/1321#issuecomment-2935590533

    def __init__(self, *args: Any, **kwargs: Any) -> None:
        super().__init__(*args, **kwargs)
        self.session = SessionStore()

    def _build_request(self, *args: Any, **kwargs: Any) -> None:
        mock = super()._build_request(*args, **kwargs)
        mock.session = self.session
        messages = FallbackStorage(mock)
        mock._messages = messages
        return mock

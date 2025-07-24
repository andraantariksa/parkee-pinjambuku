from ninja import Schema


class AdminLoginIn(Schema):
    email: str
    password: str

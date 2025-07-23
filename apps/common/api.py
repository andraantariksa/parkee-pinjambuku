from ninja import Router


router = Router()


@router.get("/ping", response={200: str})
def account_registration(request) -> str:
    return 200, "pong"

from ninja import Router


router = Router()


@router.get("/ping", response={200: str})
def ping_pong(request) -> tuple[int, str]:
    return 200, "pong"

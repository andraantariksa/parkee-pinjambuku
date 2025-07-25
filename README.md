# PinjamBuku

## Prequisities

- Python 3.12
- PNPM

## Getting Started

## Run the frontend

```
cd frontend/
pnpm install
pnpm dev
```

Open http://localhost:5173/ for customer
Open http://localhost:5173/admin for admin

## Run the backend

```
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver 8080
python manage.py create_fake_data
```

Open http://localhost:8080/admin/ for backend admin
Open http://localhost:8080/docs/ docs

## Default credential

For customer and admin

Email: admin@example.com
Password: 123
ID Card Number: 123

---

Features:

1. [x] Book Data Entry: Input book details (title, ISBN, stock).
2. [x] Borrower Data Entry: Input borrower details (ID card number, name, email).
3. [x] Borrow/Return Books: Borrowers can borrow and return books.
4. [x] Stock Check for Borrowing:
    ○ Books can be borrowed if stock is available.
    ○ Books cannot be borrowed if stock is unavailable.
5. [x] Set Return Deadline: Borrowers can set a deadline for returning books.
6. [x] One Book Per Loan: Borrowers can only borrow one book per loan.
    ○ (ALLOWED) A borrower can borrow Book X and return it on October 1, 2022.
    ○ (NOT ALLOWED) A borrower tries to borrow Book X & Y and return them on October 1, 2022.
7. [x] No Concurrent Loans: Borrowers can only borrow a book if they do not currently have an active loan.
    ○ If there's an ongoing loan, the borrower cannot borrow another book.
    ○ If there's no ongoing loan, the borrower can borrow a book.
8. [x] Loan Duration Limit: Borrowers cannot borrow a book for longer than 30 days.
9. [x] Admin Loan Tracking: Administrators can track whether borrowed books are returned on time or late.

---

## Assumption

### Tech stack

- Postgres database
- `frontend/` - React js UI
- `backend/` - Django Ninja

### Tables

- `book`
  - `id` - uint - primary key
  - `title` - varchar -indexed
  - `isbn` - varchar - indexed
  - `created_at` - timestamp - indexed
  - `updated_at` - timestamp - nullable
- `book_stock`
  - `book_id` - uint
  - `quantity` - uint
- `book_borrow_transaction`
  - `id` - uint - primary key
  - `book_id` - uint - foreign key
  - `return_scheduled_date` - date
  - `return_date` - date - nullable
  - `borrower_id` - uint
  - `created_at` - timestamp - indexed
  - `updated_at` - timestamp - nullable
- `user`
  - `id` - uint - primary key
  - `id_card_number` - varchar - indexed
  - `name` - varchar
  - `email` - varchar
  - `created_at` - timestamp - indexed
  - `updated_at` - timestamp - nullable

### UI

- Borrower flow
  - List borrowed books [2][6]
    - Return books [3]
  - List of books [7][4]
    - Borrow modal [8][2][3][5][7]
- Admin flow
  - Login
  - List books [9]
  - Book input [1]

### API

- `v1`
  - GET `books` - List books
  - GET `borrowers/{id_card_numbers}` - Borrower details & loans [2][4][6][7]
  - POST `borrowers/{id_card_numbers}/borrow` - Borrow books [2][4][5][6][7][8]
  - POST `borrowers/{id_card_numbers}/return` - Return books [2][3]
  - POST `admin/login` - Admin login
  - GET `admin/transactions` - Get borrowed books [9]
  - POST `admin/books` - Create books [1]

---

Note:

Due to the time limit, I was unable to finish the admin UI in react. You can use backend admin as a workaround http://localhost:8080/admin/

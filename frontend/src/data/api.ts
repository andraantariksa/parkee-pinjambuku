export const fetchBooks = async (): Promise<Array<Book>> => {
  const response = await fetch("http://127.0.0.1:8000/api/v1/books");
  if (!response.ok) {
    throw new Error(`${response.status} status code`);
  }
  return response.json();
};

export const borrowBook = async ({
  bookId,
  idCardNumber,
  returnDate,
  email,
  name,
}: {
  bookId: number;
  idCardNumber: string;
  returnDate: string;
  email: string;
  name: string;
}) => {
  const response = await fetch(
    `http://127.0.0.1:8000/api/v1/borrowers/${idCardNumber}/borrow`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        book_id: bookId,
        return_scheduled_date: returnDate,
        email,
        name,
      }),
    },
  );
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.detail || `${response.status} status code`);
  }

  return undefined;
};

export const returnBook = async ({
  bookId,
  idCardNumber,
  email,
  name,
}: {
  bookId: number;
  idCardNumber: string;
  email: string;
  name: string;
}) => {
  const response = await fetch(
    `http://127.0.0.1:8000/api/v1/borrowers/${idCardNumber}/return`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        book_id: bookId,
        email,
        name,
      }),
    },
  );
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.detail || `${response.status} status code`);
  }

  return undefined;
};

export interface Book {
  id: number;
  title: string;
  isbn: string;
}

export interface BookBorrowTransaction {
  id: number;
  return_date: string | null;
  return_scheduled_date: string;
  created_at: string;
  book: Book;
}

export interface BorrowerDetails {
  borrow_transactions: BookBorrowTransaction[];
}

const fetchTransactions = async (): Promise<BorrowerDetails> => {
  const response = await fetch(`http://127.0.0.1:8000/api/v1/admin/books`, {
    credentials: "include",
  });
  if (response.status === 200) {
    return response.json();
  } else if (response.status >= 400 && response.status < 500) {
    throw new Error("Unauthorized");
  } else {
    throw new Error(`${response.status} status code`);
  }
};

export interface AdminTransaction {
  id: number;
  user: {
    id: number;
    name: string;
    email: string;
  };
  book: Book;
  created_at: string;
  return_date: string | null;
  return_scheduled_date: string;
}

export const fetchAdminTransactions = async (): Promise<AdminTransaction[]> => {
  const response = await fetch(`http://127.0.0.1:8000/api/v1/admin/transactions`, {
    credentials: "include",
  });
  if (response.status === 200) {
    return response.json();
  } else if (response.status >= 400 && response.status < 500) {
    throw new Error("Unauthorized");
  } else {
    throw new Error(`${response.status} status code`);
  }
};

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

interface Book {
  id: number;
  title: string;
  isbn: string;
}

interface BookBorrowTransaction {
  id: number;
  return_date: string | null;
  return_scheduled_date: string;
  created_at: string;
  book: Book;
}

interface BorrowerDetails {
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

const BookTransactions: React.FC = () => {
  const navigate = useNavigate();

  const { data, error, isLoading } = useQuery<BorrowerDetails, Error>({
    queryKey: ["book-transactions"],
    queryFn: fetchTransactions,
  });

  if (error && error.message === "Unauthorized") {
    navigate("/admin/login");
  }

  return (
    <div>
      <h1>Book Transactions</h1>
      {isLoading && <div>Loading...</div>}
      {error && <div style={{ color: "red" }}>Error: {error.message}</div>}
      {data &&
        (data.borrow_transactions.length === 0 ? (
          <div>No transactions found</div>
        ) : (
          <ul>
            {data.borrow_transactions.map((tx) => (
              <li key={tx.id}>
                <strong>{tx.book.title}</strong> (ISBN: {tx.book.isbn})<br />
                Borrowed on: {new Date(tx.created_at).toLocaleDateString()}
                <br />
                Scheduled Return:{" "}
                {new Date(tx.return_scheduled_date).toLocaleDateString()}
                <br />
                Returned on:{" "}
                {tx.return_date
                  ? new Date(tx.return_date).toLocaleDateString()
                  : "Not returned yet"}
              </li>
            ))}
          </ul>
        ))}
    </div>
  );
};

export default BookTransactions;

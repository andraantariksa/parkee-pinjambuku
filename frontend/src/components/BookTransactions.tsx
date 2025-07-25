import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

interface Book {
  id: number;
  title: string;
  isbn: string;
}

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

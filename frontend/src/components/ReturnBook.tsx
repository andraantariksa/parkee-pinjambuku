import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useBook, useBooks } from "./BookContext";
import { useMutation } from "@tanstack/react-query";

const returnBook = async ({
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

export default function ReturnBook() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { books } = useBooks();
  const book = useBook(id, books);

  const [form, setForm] = useState({
    email: "",
    idCardNumber: "",
    name: "",
  });

  const mutation = useMutation<void, Error, void>({
    mutationFn: () =>
      returnBook({
        bookId: book!.id,
        idCardNumber: form.idCardNumber,
        email: form.email,
        name: form.name,
      }),
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  if (!books) {
    return <p>Loading</p>;
  }

  if (!book) {
    return <p>Book not found</p>;
  }

  if (mutation.isSuccess) {
    return (
      <div>
        <p>Book returned successfully!</p>
        <button onClick={() => navigate("/")}>Back to Book List</button>
      </div>
    );
  }

  return (
    <div>
      <h1>Return Book</h1>
      <p>
        <strong>Title:</strong> {book.title}
      </p>
      <p>
        <strong>ISBN:</strong> {book.isbn}
      </p>
      <div>
        <label>
          Email:{" "}
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
          />
        </label>
      </div>
      <div>
        <label>
          ID Card Number:{" "}
          <input
            type="text"
            name="idCardNumber"
            value={form.idCardNumber}
            onChange={handleChange}
            required
          />
        </label>
      </div>
      <div>
        <label>
          Name:{" "}
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
          />
        </label>
      </div>
      <button
        onClick={() => mutation.mutate()}
        disabled={mutation.isPending ?? false}
      >
        Return Book
      </button>
      {mutation.isPending && <p>Loading...</p>}
      {mutation.error && (
        <p style={{ color: "red" }}>Error: {mutation.error.message}</p>
      )}
    </div>
  );
}

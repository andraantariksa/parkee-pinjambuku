import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { useBook, useBooks } from "../context/BookContext";
import { useMember } from "../context/MemberContext";
import { borrowBook } from "../data/api";

export default function BorrowBook() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { books } = useBooks();
  const book = useBook(id, books);
  const memberContext = useMember();
  const member = memberContext.member;

  const [form, setForm] = useState({
    returnDate: "",
  });

  const mutation = useMutation<void, Error, void>({
    mutationFn: () =>
      borrowBook({
        bookId: book!.id,
        idCardNumber: member!.idCardNumber,
        returnDate: form.returnDate,
        email: member!.email,
        name: member!.name,
      }),
  });

  useEffect(() => {
    if (member) return;
    navigate("/");
  }, [member, navigate]);

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
        <p>Book borrowed successfully!</p>
        <button onClick={() => navigate("/books")}>Back to Book List</button>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        mutation.mutate();
      }}
    >
      <h1>Borrow Book</h1>
      <button onClick={() => navigate("/books")}>Back to Book List</button>
      <p>
        <strong>Title:</strong> {book.title}
      </p>
      <p>
        <strong>ISBN:</strong> {book.isbn}
      </p>
      <div>
        <label>
          Return Scheduled Date:{" "}
          <input
            type="date"
            name="returnDate"
            value={form.returnDate}
            onChange={handleChange}
            required
          />
        </label>
      </div>
      <button type="submit" disabled={mutation.isPending ?? false}>
        Borrow Book
      </button>
      {mutation.isPending && <p>Loading...</p>}
      {mutation.error && (
        <p style={{ color: "red" }}>Error: {mutation.error.message}</p>
      )}
    </form>
  );
}

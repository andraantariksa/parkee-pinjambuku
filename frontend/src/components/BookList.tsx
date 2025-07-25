import React, { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useBooks } from "../context/BookContext";
import { useMember } from "../context/MemberContext";
import { useNavigate } from "react-router-dom";
import { borrowBook, returnBook, fetchBooks, type Book } from "../data/api";

export default function BookList() {
  const { books, isLoading, error, refetch } = useBooks();
  const memberContext = useMember();
  const member = memberContext.member;
  const navigate = useNavigate();

  const borrowMutation = useMutation<void, Error, number>({
    mutationFn: (bookId) =>
      borrowBook({
        bookId,
        idCardNumber: member!.idCardNumber,
        returnDate: "",
        email: member!.email,
        name: member!.name,
      }),
  });

  const returnMutation = useMutation<void, Error, number>({
    mutationFn: (bookId) =>
      returnBook({
        bookId,
        idCardNumber: member!.idCardNumber,
        email: member!.email,
        name: member!.name,
      }),
  });

  useEffect(() => {
    if (member) return;
    navigate("/");
  }, [member, navigate]);

  const isPending = borrowMutation.isPending || returnMutation.isPending;

  useEffect(() => {
    refetch();
  }, [borrowMutation.isSuccess, returnMutation.isSuccess]);

  return (
    <div>
      <h1>Book List</h1>
      {isLoading && <div>Loading...</div>}
      {error && <div style={{ color: "red" }}>Error: {error.message}</div>}
      {returnMutation.error && <p style={{ color: "red" }}>{returnMutation.error.message}</p>}
      {books && (
        <ul>
          {books.map((book: Book) => (
            <li key={book.id}>
              <strong>{book.title}</strong> (ISBN: {book.isbn}){" "}
              <button
                onClick={() => {
                  borrowMutation.mutate(book.id);
                }}
                style={{ marginLeft: "10px" }}
                disabled={isPending}
              >
                Borrow
              </button>
              <button
                onClick={() => {
                  returnMutation.mutate(book.id);
                }}
                style={{ marginLeft: "5px" }}
                disabled={isPending}
              >
                Return
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

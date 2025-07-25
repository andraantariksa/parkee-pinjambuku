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

  const returnMutation = useMutation<void, Error, number>({
    mutationFn: (bookId) =>
      returnBook({
        bookId,
        idCardNumber: member!.idCardNumber,
        email: member!.email,
        name: member!.name,
      }),
    onSuccess: () => {
      memberContext.refetch();
    },
  });

  useEffect(() => {
    memberContext.refetch();
  }, []);

  useEffect(() => {
    if (member) return;
    navigate("/");
  }, [member, navigate]);

  const isPending = returnMutation.isPending;

  useEffect(() => {
    refetch();
  }, [returnMutation.isSuccess]);

  return (
    <div>
      <h1>Book List</h1>
      {isLoading && <div>Loading...</div>}
      {error && <div style={{ color: "red" }}>Error: {error.message}</div>}
      {returnMutation.error && (
        <p style={{ color: "red" }}>{returnMutation.error.message}</p>
      )}
      {books && memberContext.data && (
        <ul>
          {books.map((book: Book) => (
            <li key={book.id}>
              <strong>{book.title}</strong> (ISBN: {book.isbn}){" "}
              <button
                onClick={() => {
                  navigate(`/books/${book.id}/borrow`);
                }}
                style={{ marginLeft: "10px" }}
                disabled={isPending || memberContext.borrowTrx}
              >
                Borrow
              </button>
              <button
                onClick={() => {
                  returnMutation.mutate(book.id);
                }}
                style={{ marginLeft: "5px" }}
                disabled={
                  isPending || memberContext.borrowTrx?.book?.id !== book.id
                }
              >
                Return
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

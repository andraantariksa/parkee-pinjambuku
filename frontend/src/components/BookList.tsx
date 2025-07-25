import React from "react";
import { useQuery } from "@tanstack/react-query";

interface Book {
  id: number;
  title: string;
  isbn: string;
}

const fetchBooks = async (): Promise<Book[]> => {
  const response = await fetch("http://127.0.0.1:8000/api/v1/books");
  if (!response.ok) {
    throw new Error(`${response.status} status code`);
  }
  return response.json();
};

const BookList: React.FC = () => {
  const { data, error, isLoading } = useQuery<Array<Book>, Error>({
    queryKey: ["fetch-books"],
    queryFn: fetchBooks,
  });

  return (
    <div>
      <h1>Book List</h1>
      {isLoading && <div>Loading...</div>}
      {error && <div style={{ color: "red" }}>Error: {error.message}</div>}
      {data && (
        <ul>
          {data.map((book: Book) => (
            <li key={book.id}>
              <strong>{book.title}</strong> (ISBN: {book.isbn})
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default BookList;

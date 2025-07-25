import React, { createContext, useContext } from "react";
import { useQuery } from "@tanstack/react-query";

interface Book {
  id: number;
  title: string;
  isbn: string;
}

interface BookContextValue {
  books: Book[] | undefined;
  isLoading: boolean;
  error: Error | null;
}

const BookContext = createContext<BookContextValue>({
  books: undefined,
  isLoading: false,
  error: null,
});

const fetchBooks = async (): Promise<Book[]> => {
  const response = await fetch("http://127.0.0.1:8000/api/v1/books");
  if (!response.ok) {
    throw new Error(`${response.status} status code`);
  }
  return response.json();
};

export const BookProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { data, error, isLoading } = useQuery<Book[], Error>({
    queryKey: ["fetch-books"],
    queryFn: fetchBooks,
  });

  return (
    <BookContext.Provider value={{ books: data, isLoading, error }}>
      {children}
    </BookContext.Provider>
  );
};

export const useBooks = () => useContext(BookContext);

export const useBook = (
  id: string | number | undefined,
  books: Array<Book> | undefined,
) => {
  const bookId = typeof id === "string" ? parseInt(id, 10) : id;
  return books?.find((b) => b.id === bookId);
};

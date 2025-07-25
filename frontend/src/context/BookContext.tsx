import React, { createContext, useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchBooks } from "../data/api";

interface Book {
  id: number;
  title: string;
  isbn: string;
}

interface BookContextValue {
  books: Book[] | undefined;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

const BookContext = createContext<BookContextValue>({
  books: undefined,
  isLoading: false,
  error: null,
  refetch: () => {},
});

export const BookProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { data, error, isLoading, refetch } = useQuery<Book[], Error>({
    queryKey: ["fetch-books"],
    queryFn: fetchBooks,
  });

  return (
    <BookContext.Provider value={{ books: data, isLoading, error, refetch }}>
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

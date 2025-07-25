import React from 'react';
import { useQuery } from '@tanstack/react-query';

interface Book {
  id: number;
  title: string;
  isbn: string;
}

const fetchBooks = async (): Promise<Book[]> => {
  const response = await fetch('http://127.0.0.1:8000/api/v1/books/');
  if (!response.ok) {
    throw new Error(`Error fetching books [${response.status}]`);
  }
  return response.json();
};

const BookList: React.FC = () => {
  const { data, error, isLoading } = useQuery<Array<Book>, Error>({
    queryKey: ['books'],
    queryFn: fetchBooks,
  });

  let content;
  if (isLoading) {
    content = <div>Loading...</div>;
  } else if (error) {
    content = <div>Error: {error.message}</div>;
  } else {
    content = (
      <ul>
        {data?.map((book: Book) => (
          <li key={book.id}>
            <strong>{book.title}</strong> (ISBN: {book.isbn})
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div>
      <h1>Book List</h1>
      {content}
    </div>
  );
};

export default BookList;

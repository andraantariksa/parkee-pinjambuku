import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import BookList from "./components/BookList";
import { BookProvider } from "./components/BookContext";
import BorrowBook from "./components/BorrowBook";
import ReturnBook from "./components/ReturnBook";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import BookTransactions from "./components/BookTransactions";
import AdminLogin from "./components/AdminLogin";
import Login from "./components/Login";
import { MemberProvider } from "./context/MemberContext";

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <MemberProvider>
        <BookProvider>
          <Router>
            <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/books" element={<BookList />} />
              <Route path="/books/:id/borrow" element={<BorrowBook />} />
              <Route path="/books/:id/return" element={<ReturnBook />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route
                path="/admin/book-transactions"
                element={<BookTransactions />}
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
        </BookProvider>
      </MemberProvider>
    </QueryClientProvider>
  );
}

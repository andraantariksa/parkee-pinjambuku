import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import BookList from "./components/BookList";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import BookTransactions from "./components/BookTransactions";
import AdminLogin from "./components/AdminLogin";

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/" element={<BookList />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin/book-transactions"
            element={<BookTransactions />}
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}

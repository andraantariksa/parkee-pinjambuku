import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import BookList from "./components/BookList";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/" element={<BookList />} />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}

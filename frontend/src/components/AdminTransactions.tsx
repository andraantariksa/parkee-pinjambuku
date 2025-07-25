import React, { useEffect, useState } from "react";
import { fetchAdminTransactions } from "../data/api";
import type { AdminTransaction } from "../data/api";

const AdminTransactions: React.FC = () => {
  const [transactions, setTransactions] = useState<AdminTransaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTransactions = async () => {
      try {
        const data = await fetchAdminTransactions();
        setTransactions(data);
      } catch (err: any) {
        setError(err.message || "Failed to load transactions");
      } finally {
        setLoading(false);
      }
    };

    loadTransactions();
  }, []);

  if (loading) {
    return <div>Loading transactions...</div>;
  }

  if (error) {
    return <div style={{ color: "red" }}>Error: {error}</div>;
  }

  return (
    <div>
      <h2>Admin Transactions</h2>
      {transactions.length === 0 ? (
        <p>No transactions found.</p>
      ) : (
        <table border={1} cellPadding={5} cellSpacing={0}>
          <thead>
            <tr>
              <th>Transaction ID</th>
              <th>User Name</th>
              <th>User Email</th>
              <th>Book Title</th>
              <th>Created At</th>
              <th>Return Scheduled Date</th>
              <th>Return Date</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx) => (
              <tr key={tx.id}>
                <td>{tx.id}</td>
                <td>{tx.user.name}</td>
                <td>{tx.user.email}</td>
                <td>{tx.book.title}</td>
                <td>{new Date(tx.created_at).toLocaleString()}</td>
                <td>{new Date(tx.return_scheduled_date).toLocaleDateString()}</td>
                <td>{tx.return_date ? new Date(tx.return_date).toLocaleDateString() : "-" }</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminTransactions;

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { useMember } from "../context/MemberContext";

const loginMember = async ({
  idCardNumber,
  email,
}: {
  idCardNumber: string;
  email: string;
}) => {
  const response = await fetch(
    `http://127.0.0.1:8000/api/v1/borrowers/${idCardNumber}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    },
  );
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.detail || `${response.status} status code`);
  }
  return undefined;
};

export default function Login() {
  const [form, setForm] = useState({
    idCardNumber: "",
    name: "",
    email: "",
  });
  const navigate = useNavigate();
  const { setMember } = useMember();

  const mutation = useMutation<void, Error, void>({
    mutationFn: () =>
      loginMember({
        idCardNumber: form.idCardNumber,
        email: form.email,
      }),
    onSuccess: () => {
      setMember({
        idCardNumber: form.idCardNumber,
        name: form.name,
        email: form.email,
      });
      navigate("/books");
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate();
  };

  return (
    <div>
      <h1>Login</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>
            ID Card Number:{" "}
            <input
              type="text"
              name="idCardNumber"
              value={form.idCardNumber}
              onChange={handleChange}
              required
            />
          </label>
        </div>
        <div>
          <label>
            Name:{" "}
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
            />
          </label>
        </div>
        <div>
          <label>
            Email:{" "}
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </label>
        </div>
        <button type="submit" disabled={mutation.isPending}>
          Login
        </button>
        {mutation.isError && (
          <p style={{ color: "red" }}>Error: {mutation.error?.message}</p>
        )}
        {mutation.isPending && <p>Loading...</p>}
      </form>
    </div>
  );
}

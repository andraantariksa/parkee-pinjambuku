import { useQuery } from "@tanstack/react-query";
import React, { createContext, useContext, useState } from "react";

interface Member {
  idCardNumber: string;
  name: string;
  email: string;
}

interface MemberContextType {
  member: Member | null;
  setMember: React.Dispatch<React.SetStateAction<Member | null>>;
  refetch: () => void;
  error: Error | null;
  isLoading: boolean;
  borrowTrx: any;
  data: any;
}

const MemberContext = createContext<MemberContextType | undefined>(undefined);

export const useMember = () => {
  const context = useContext(MemberContext);
  if (!context) {
    throw new Error("useMember must be used within a MemberProvider");
  }
  return context;
};

export const MemberProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [member, setMember] = useState<Member | null>(null);
  const fetchUserBooks = async () => {
    if (!member?.idCardNumber) {
      throw new Error("Member ID card number is required");
    }

    const response = await fetch(
      `http://127.0.0.1:8000/api/v1/borrowers/${member.idCardNumber}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: member.email,
          name: member.name,
        }),
      },
    );
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.detail || `${response.status} status code`);
    }

    return await response.json();
  };
  const { data, error, isLoading, refetch } = useQuery<any, Error>({
    queryKey: ["fetch-user-books", member?.idCardNumber],
    queryFn: fetchUserBooks,
  });
  const transactions: undefined | any[] = data?.borrow_transactions;
  let borrowing;
  if (transactions) {
    borrowing = transactions.find((tx: any) => tx.return_date === null);
  } else {
    borrowing = true;
  }

  return (
    <MemberContext.Provider value={{ member, setMember, data, refetch, error, isLoading, borrowTrx: borrowing }}>
      {children}
    </MemberContext.Provider>
  );
};

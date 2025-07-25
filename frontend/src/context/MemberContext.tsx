import React, { createContext, useContext, useState } from "react";

interface Member {
  idCardNumber: string;
  name: string;
  email: string;
}

interface MemberContextType {
  member: Member | null;
  setMember: React.Dispatch<React.SetStateAction<Member | null>>;
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
  return (
    <MemberContext.Provider value={{ member, setMember }}>
      {children}
    </MemberContext.Provider>
  );
};

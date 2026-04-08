import React from "react";
import { AuthProvider } from "../contexts/AuthContext";

export default function Root({ children }: { children: React.ReactNode }): React.ReactElement {
  return <AuthProvider>{children}</AuthProvider>;
}

import React from "react";
import { useAuth } from "../../contexts/AuthContext";

export default function AuthButtons(): React.ReactElement {
  const { user, loading, logout } = useAuth();

  if (loading) {
    return <div className="navbar__item" />;
  }

  if (user) {
    return (
      <div className="navbar__item" style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <span style={{ fontWeight: 500 }}>{user.display_name}</span>
        <button
          className="button button--secondary button--sm"
          onClick={() => logout()}
          type="button"
        >
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <div className="navbar__item" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
      <a href="/signin" className="button button--secondary button--sm">
        Sign In
      </a>
      <a href="/signup" className="button button--primary button--sm">
        Sign Up
      </a>
    </div>
  );
}

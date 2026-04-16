import React from "react";
import BrowserOnly from "@docusaurus/BrowserOnly";
import { useAuth } from "../../contexts/AuthContext";

function AuthButtonsInner(): React.ReactElement {
  const { user, loading, logout } = useAuth();

  if (loading) {
    return <div className="navbar__item" />;
  }

  if (user) {
    return (
      <div
        className="navbar__item"
        style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}
      >
        <span
          style={{
            fontFamily: "'Outfit', sans-serif",
            fontWeight: 600,
            fontSize: "0.85rem",
            color: "var(--ifm-color-primary)",
            background: "var(--color-glow)",
            padding: "0.3rem 0.75rem",
            borderRadius: "0.5rem",
            letterSpacing: "-0.01em",
          }}
        >
          {user.display_name}
        </span>
        <button
          className="button button--secondary button--sm"
          onClick={() => logout()}
          type="button"
          style={{ fontSize: "0.8rem" }}
        >
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <div
      className="navbar__item"
      style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
    >
      <a
        href="/signin"
        className="button button--secondary button--sm"
        style={{ fontSize: "0.8rem" }}
      >
        Sign In
      </a>
      <a
        href="/signup"
        className="button button--primary button--sm"
        style={{ fontSize: "0.8rem" }}
      >
        Sign Up
      </a>
    </div>
  );
}

export default function AuthButtons(): React.ReactElement {
  return (
    <BrowserOnly fallback={<div className="navbar__item" />}>
      {() => <AuthButtonsInner />}
    </BrowserOnly>
  );
}

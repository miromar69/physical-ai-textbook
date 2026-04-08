import React, { useState } from "react";
import Layout from "@theme/Layout";
import { useAuth } from "../contexts/AuthContext";

export default function SigninPage(): React.ReactElement {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(email, password);
      window.location.href = "/";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout title="Sign In" description="Sign in to your account">
      <div style={{ maxWidth: 480, margin: "2rem auto", padding: "0 1rem" }}>
        <h1>Sign In</h1>

        {error && (
          <div role="alert" style={{ color: "var(--ifm-color-danger)", marginBottom: "1rem" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "1rem" }}>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ width: "100%", padding: "0.5rem", marginTop: "0.25rem" }}
            />
          </div>
          <div style={{ marginBottom: "1rem" }}>
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ width: "100%", padding: "0.5rem", marginTop: "0.25rem" }}
            />
          </div>
          <button
            type="submit"
            className="button button--primary button--lg"
            disabled={submitting}
            style={{ width: "100%" }}
          >
            {submitting ? "Signing In..." : "Sign In"}
          </button>
          <p style={{ marginTop: "1rem", textAlign: "center" }}>
            Don't have an account? <a href="/signup">Sign up</a>
          </p>
        </form>
      </div>
    </Layout>
  );
}

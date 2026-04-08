import React, { useState } from "react";
import Layout from "@theme/Layout";
import { useAuth, type BackgroundProfile } from "../contexts/AuthContext";

type SkillLevel = "beginner" | "intermediate" | "advanced";

const SKILL_OPTIONS: { value: SkillLevel; label: string }[] = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

const SKILL_FIELDS: { key: keyof Pick<BackgroundProfile, "python_level" | "ros_level" | "ml_ai_level" | "simulation_level">; label: string }[] = [
  { key: "python_level", label: "Python" },
  { key: "ros_level", label: "ROS 2" },
  { key: "ml_ai_level", label: "Machine Learning / AI" },
  { key: "simulation_level", label: "Robotics Simulation" },
];

export default function SignupPage(): React.ReactElement {
  const { signup } = useAuth();
  const [step, setStep] = useState<1 | 2>(1);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Step 1: Account
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");

  // Step 2: Profile
  const [profile, setProfile] = useState<BackgroundProfile>({
    python_level: "beginner",
    ros_level: "beginner",
    ml_ai_level: "beginner",
    simulation_level: "beginner",
    has_gpu: false,
    has_robot_kit: false,
    has_sensors: false,
  });

  const handleStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await signup({ email, password, display_name: displayName, profile });
      window.location.href = "/";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed");
    } finally {
      setSubmitting(false);
    }
  };

  const updateSkill = (key: string, value: SkillLevel) => {
    setProfile((prev) => ({ ...prev, [key]: value }));
  };

  const updateHardware = (key: string, value: boolean) => {
    setProfile((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <Layout title="Sign Up" description="Create your account">
      <div style={{ maxWidth: 480, margin: "2rem auto", padding: "0 1rem" }}>
        <h1>Sign Up</h1>

        {error && (
          <div role="alert" style={{ color: "var(--ifm-color-danger)", marginBottom: "1rem" }}>
            {error}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleStep1}>
            <h3>Step 1: Account Details</h3>
            <div style={{ marginBottom: "1rem" }}>
              <label htmlFor="displayName">Display Name</label>
              <input
                id="displayName"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
                style={{ width: "100%", padding: "0.5rem", marginTop: "0.25rem" }}
              />
            </div>
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
              <label htmlFor="password">Password (min 8 characters)</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                style={{ width: "100%", padding: "0.5rem", marginTop: "0.25rem" }}
              />
            </div>
            <button
              type="submit"
              className="button button--primary button--lg"
              style={{ width: "100%" }}
            >
              Next: Background Profile
            </button>
            <p style={{ marginTop: "1rem", textAlign: "center" }}>
              Already have an account? <a href="/signin">Sign in</a>
            </p>
          </form>
        ) : (
          <form onSubmit={handleSubmit}>
            <h3>Step 2: Background Profile</h3>
            <p>Help us personalize your learning experience.</p>

            <h4>Skill Levels</h4>
            {SKILL_FIELDS.map(({ key, label }) => (
              <div key={key} style={{ marginBottom: "1rem" }}>
                <label>{label}</label>
                <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.25rem" }}>
                  {SKILL_OPTIONS.map((opt) => (
                    <label key={opt.value} style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                      <input
                        type="radio"
                        name={key}
                        value={opt.value}
                        checked={profile[key] === opt.value}
                        onChange={() => updateSkill(key, opt.value)}
                      />
                      {opt.label}
                    </label>
                  ))}
                </div>
              </div>
            ))}

            <h4>Hardware Access</h4>
            {[
              { key: "has_gpu", label: "GPU (NVIDIA with CUDA)" },
              { key: "has_robot_kit", label: "Robot Kit (e.g., TurtleBot, manipulator arm)" },
              { key: "has_sensors", label: "Sensors (LiDAR, cameras, IMU)" },
            ].map(({ key, label }) => (
              <div key={key} style={{ marginBottom: "0.5rem" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <input
                    type="checkbox"
                    checked={profile[key as keyof BackgroundProfile] as boolean}
                    onChange={(e) => updateHardware(key, e.target.checked)}
                  />
                  {label}
                </label>
              </div>
            ))}

            <div style={{ display: "flex", gap: "1rem", marginTop: "1.5rem" }}>
              <button
                type="button"
                className="button button--secondary button--lg"
                onClick={() => setStep(1)}
                style={{ flex: 1 }}
              >
                Back
              </button>
              <button
                type="submit"
                className="button button--primary button--lg"
                disabled={submitting}
                style={{ flex: 1 }}
              >
                {submitting ? "Creating Account..." : "Create Account"}
              </button>
            </div>
          </form>
        )}
      </div>
    </Layout>
  );
}

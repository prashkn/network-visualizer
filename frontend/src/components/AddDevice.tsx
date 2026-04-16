import { useState } from "react";
import { useNavigate } from "react-router-dom";

export function AddDevice() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    setStatus("submitting");
    try {
      const res = await fetch("/devices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });
      if (!res.ok) throw new Error();
      setStatus("success");
      setName("");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div style={{ color: "#fff", textAlign: "center", padding: "2rem" }}>
      <h1 style={{marginBottom: '10px'}}>join network</h1>
      {status === "success" ? (
        <p>You're in!</p>
      ) : (
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="What's your name?"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={status === "submitting"}
            style={{
              padding: "0.75rem 1rem",
              fontSize: "1.1rem",
              borderRadius: "8px",
              border: "1px solid #444",
              background: "#2a2a3e",
              color: "#fff",
              marginRight: "0.5rem",
            }}
          />
          <button
            type="submit"
            disabled={status === "submitting" || !name.trim()}
            style={{
              padding: "0.75rem 1.5rem",
              fontSize: "1.1rem",
              borderRadius: "8px",
              border: "none",
              background: "#4a9eff",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            {status === "submitting" ? "Joining..." : "Join"}
          </button>
          {status === "error" && <p style={{ color: "#ff6b6b" }}>Something went wrong. Try again.</p>}
        </form>
      )}
      <button
        onClick={() => navigate("/")}
        style={{
          marginTop: "1rem",
          padding: "0.5rem 1.25rem",
          fontSize: "1rem",
          borderRadius: "8px",
          border: "1px solid #444",
          background: "transparent",
          color: "#4a9eff",
          cursor: "pointer",
        }}
      >
        Home
      </button>
    </div>
  );
}

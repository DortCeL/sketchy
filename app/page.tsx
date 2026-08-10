"use client";

import { useState } from "react";

type CheckResult = {
    sketchy: boolean;
    confidence: "low" | "medium" | "high";
    summary: string;
    redFlags: string[];
};

export default function Home() {
    const [text, setText] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [result, setResult] = useState<CheckResult | null>(null);

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        setResult(null);

        const trimmed = text.trim();
        if (!trimmed) {
        setError("paste a job description first");
        return;
        }

        setLoading(true);
        try {
        const res = await fetch("/api/check", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: trimmed }),
        });
        const data = await res.json();
        if (!res.ok) {
            throw new Error(data.error || "request failed");
        }
        setResult(data);
        } catch (err) {
        setError(err instanceof Error ? err.message : "something went wrong");
        } finally {
        setLoading(false);
        }
    }

    return (
        <main className="page">
        <h1>sketchy?</h1>
        <p className="sub">
            paste a job description. i&apos;ll tell you if it looks shady.
        </p>

        <form onSubmit={onSubmit}>
            <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="job description goes here..."
            rows={12}
            />
            <button type="submit" disabled={loading}>
            {loading ? "checking..." : "check"}
            </button>
        </form>

        {error && <p className="error">{error}</p>}

        {result && (
            <div className="result">
            <p className={result.sketchy ? "bad" : "ok"}>
                {result.sketchy ? "yeah, this looks sketchy" : "seems fine"}
                <span className="conf"> · {result.confidence} confidence</span>
            </p>
            <p>{result.summary}</p>
            {result.redFlags?.length > 0 && (
                <ul>
                {result.redFlags.map((flag) => (
                    <li key={flag}>{flag}</li>
                ))}
                </ul>
            )}
            </div>
        )}
        </main>
    );
}

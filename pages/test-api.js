"use client";
import { useEffect, useState } from "react";

export default function TestAPI() {
  const [result, setResult] = useState("⏳ Checking connection...");

  useEffect(() => {
    const url = `${process.env.NEXT_PUBLIC_API_URL}/health`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => setResult(`✅ Connected: ${JSON.stringify(data)}`))
      .catch((err) => setResult(`❌ Error: ${err.message}`));
  }, []);

  return (
    <div style={{
      fontFamily: "monospace",
      padding: "40px",
      background: "#111",
      color: "#0f0",
      minHeight: "100vh"
    }}>
      <h1>API Connection Test</h1>
      <p>{result}</p>
    </div>
  );
}

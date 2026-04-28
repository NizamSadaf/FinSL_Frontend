// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
// import './App.css'

// function App() {
//   const [count, setCount] = useState(0)

//   return (
//     <>
//       <div>
//         <a href="https://vite.dev" target="_blank">
//           <img src={viteLogo} className="logo" alt="Vite logo" />
//         </a>
//         <a href="https://react.dev" target="_blank">
//           <img src={reactLogo} className="logo react" alt="React logo" />
//         </a>
//       </div>
//       <h1>Vite + React</h1>
//       <div className="card">
//         <button onClick={() => setCount((count) => count + 1)}>
//           count is {count}
//         </button>
//         <p>
//           Edit <code>src/App.jsx</code> and save to test HMR
//         </p>
//       </div>
//       <p className="read-the-docs">
//         Click on the Vite and React logos to learn more
//       </p>
//     </>
//   )
// }

// export default App

import { useState } from "react";
import axios from "axios";

const API_BASE = "http://localhost:8000";

export default function App() {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  function onFileChange(e) {
    const f = e.target.files?.[0];
    setResult(null);
    setError("");
    setFile(f || null);

    if (f) {
      const url = URL.createObjectURL(f);
      setPreviewUrl(url);
    } else {
      setPreviewUrl("");
    }
  }

  async function onPredict() {
    if (!file) {
      setError("Please choose a video first.");
      return;
    }

    setBusy(true);
    setError("");
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await axios.post(`${API_BASE}/predict`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        // If your videos are large, you might want a bigger timeout:
        timeout: 120000,
      });

      setResult(res.data);
    } catch (err) {
      const msg =
        err?.response?.data?.detail ||
        err?.message ||
        "Something went wrong while calling the backend.";
      setError(String(msg));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ maxWidth: 720, margin: "40px auto", fontFamily: "system-ui" }}>
      <h1>Sign Recognition UI</h1>

      <div style={{ padding: 16, border: "1px solid #ddd", borderRadius: 12 }}>
        <label style={{ display: "block", marginBottom: 8 }}>
          Upload a short sign video:
        </label>

        <input type="file" accept="video/*" onChange={onFileChange} />

        {previewUrl && (
          <div style={{ marginTop: 16 }}>
            <video
              src={previewUrl}
              controls
              style={{ width: "100%", borderRadius: 12 }}
            />
          </div>
        )}

        <button
          onClick={onPredict}
          disabled={busy || !file}
          style={{
            marginTop: 16,
            padding: "10px 14px",
            borderRadius: 10,
            border: "1px solid #333",
            background: busy ? "#eee" : "#fff",
            cursor: busy ? "not-allowed" : "pointer",
          }}
        >
          {busy ? "Predicting..." : "Predict"}
        </button>

        {error && (
          <p style={{ marginTop: 12, color: "crimson" }}>
            <b>Error:</b> {error}
          </p>
        )}

        {result && (
          <div
            style={{
              marginTop: 16,
              padding: 12,
              borderRadius: 12,
              background: "#f6f6f6",
            }}
          >
            <h3 style={{ marginTop: 0 }}>Result</h3>
            <p style={{ margin: 0 }}>
              <b>Label:</b> {result.predicted_label}
            </p>
            <p style={{ margin: 0 }}>
              <b>Confidence:</b>{" "}
              {typeof result.confidence === "number"
                ? result.confidence.toFixed(3)
                : result.confidence}
            </p>
          </div>
        )}
      </div>

      <p style={{ marginTop: 14, color: "#555" }}>
        Backend must be running at <code>{API_BASE}</code>.
      </p>
    </div>
  );
}

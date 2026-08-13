const API_BASE = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });
  if (!response.ok) {
    let message = `请求失败（${response.status}）`;
    try {
      const body = await response.json();
      message = body.detail || message;
    } catch {
      // Keep the status based message when the server did not return JSON.
    }
    throw new Error(typeof message === "string" ? message : JSON.stringify(message));
  }
  return response.json();
}

export function analyzeJd({ jdText, profile, sourceUrl }) {
  return request("/api/pipeline/analyze", {
    method: "POST",
    body: JSON.stringify({ jd_text: jdText, profile, source_url: sourceUrl || null }),
  });
}

export function getApiHealth() {
  return request("/api/health");
}

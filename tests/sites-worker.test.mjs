import assert from "node:assert/strict";
import { access } from "node:fs/promises";
import test from "node:test";
import worker from "../worker/index.js";

test("serves existing static assets without a fallback", async () => {
  const calls = [];
  const response = await worker.fetch(new Request("https://example.test/assets/app.js"), {
    ASSETS: {
      fetch: async (request) => {
        calls.push(new URL(request.url).pathname);
        return new Response("asset", { status: 200 });
      },
    },
  });

  assert.equal(response.status, 200);
  assert.deepEqual(calls, ["/assets/app.js"]);
});

test("falls back to index.html for an unknown app route", async () => {
  const calls = [];
  const response = await worker.fetch(
    new Request("https://example.test/flow/step-two?source=share", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async (request) => {
          const url = new URL(request.url);
          calls.push(url.pathname + url.search);
          return new Response(url.pathname === "/index.html" ? "app" : "missing", {
            status: url.pathname === "/index.html" ? 200 : 404,
          });
        },
      },
    },
  );

  assert.equal(response.status, 200);
  assert.deepEqual(calls, ["/flow/step-two?source=share", "/index.html"]);
});

test("does not turn missing API or write requests into the app shell", async () => {
  for (const [request, expectedAssetCalls] of [
    [new Request("https://example.test/api/missing", { headers: { accept: "application/json" } }), 0],
    [new Request("https://example.test/flow", { method: "POST", headers: { accept: "text/html" } }), 1],
  ]) {
    let calls = 0;
    const response = await worker.fetch(request, {
      ASSETS: {
        fetch: async () => {
          calls += 1;
          return new Response("missing", { status: 404 });
        },
      },
    });

    assert.equal(response.status, 404);
    assert.equal(calls, expectedAssetCalls);
  }
});

test("serves the online demo API without a model key", async () => {
  const response = await worker.fetch(new Request("https://example.test/api/pipeline/analyze", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      jd_text: "AI 产品经理实习生，工作地点上海，每周到岗5天，连续实习3个月。负责 Agent、Prompt、SQL 与用户研究。",
      profile: { name: "王", intent: "AI 产品经理实习生", education: "硕士", major: "应用统计", gradYear: "2028", city: "上海", days: "5", months: "3", skills: "Python、Dify" },
    }),
  }), { ASSETS: { fetch: async () => new Response("missing", { status: 404 }) } });

  const data = await response.json();
  assert.equal(response.status, 200);
  assert.equal(data.mode, "demo");
  assert.equal(data.job.city, "上海");
  assert.ok(data.job.requiredSkills.includes("SQL"));
  assert.ok(data.learning.steps.length >= 3);
  assert.ok(data.learning.questions.length >= 3);
});

test("emits the files required by Sites packaging", async () => {
  await access(new URL("../dist/client/index.html", import.meta.url));
  await access(new URL("../dist/server/index.js", import.meta.url));
  await access(new URL("../dist/.openai/hosting.json", import.meta.url));
});

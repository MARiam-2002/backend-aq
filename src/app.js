/**
 * Express app (used locally + on Vercel via serverless-http).
 */
import "dotenv/config";
import express from "express";
import cors from "cors";
import { createClient } from "@supabase/supabase-js";
import { openapiSpec } from "./openapi.js";

const app = express();

app.use(cors({ origin: true }));
app.use(express.json());

app.get("/openapi.json", (_req, res) => {
  res.json(openapiSpec);
});

/**
 * Swagger UI via CDN — swagger-ui-express static assets often break on Vercel
 * serverless (blank page); loading UI from unpkg avoids serving node_modules.
 */
const SWAGGER_UI_CDN = "https://unpkg.com/swagger-ui-dist@5.11.0";
const swaggerUiPage = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Estate Luxe API — Swagger</title>
<link rel="stylesheet" href="${SWAGGER_UI_CDN}/swagger-ui.css" />
<style>html{box-sizing:border-box}*,*::before,*::after{box-sizing:inherit}body{margin:0}</style>
</head>
<body>
<div id="swagger-ui"></div>
<script src="${SWAGGER_UI_CDN}/swagger-ui-bundle.js" crossorigin></script>
<script>
window.onload = function () {
  window.ui = SwaggerUIBundle({
    url: "/openapi.json",
    dom_id: "#swagger-ui",
  });
};
</script>
</body>
</html>`;

app.get(["/api-docs", "/api-docs/"], (_req, res) => {
  res.type("html").send(swaggerUiPage);
});

const url = process.env.SUPABASE_URL ?? "";
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

function getAdmin() {
  if (!url || !serviceKey) return null;
  return createClient(url, serviceKey);
}

app.get("/", (_req, res) => {
  res.json({
    name: "Estate Luxe API",
    health: "/api/health",
    docs: "/api-docs",
    openapi: "/openapi.json",
    endpoints: ["/api/health", "/api/tenants"],
  });
});

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, supabase: Boolean(getAdmin()) });
});

app.get("/api/tenants", async (_req, res) => {
  const admin = getAdmin();
  if (!admin) {
    res.status(503).json({ error: "Supabase not configured on server" });
    return;
  }
  const { data, error } = await admin.from("tenants").select("*").order("name");
  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }
  res.json(data);
});

app.post("/api/tenants", async (req, res) => {
  const admin = getAdmin();
  if (!admin) {
    res.status(503).json({ error: "Supabase not configured on server" });
    return;
  }
  const { data, error } = await admin.from("tenants").insert(req.body).select().single();
  if (error) {
    res.status(400).json({ error: error.message });
    return;
  }
  res.json(data);
});

export { app };

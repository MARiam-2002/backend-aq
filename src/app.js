/**
 * Express app (used locally + on Vercel via serverless-http).
 */
import "dotenv/config";
import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import { createClient } from "@supabase/supabase-js";
import { openapiSpec } from "./openapi.js";

const app = express();

app.use(cors({ origin: true }));
app.use(express.json());

app.get("/openapi.json", (_req, res) => {
  res.json(openapiSpec);
});

app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(openapiSpec, {
    customCss: ".swagger-ui .topbar { display: none }",
    customSiteTitle: "Estate Luxe API — Swagger",
  }),
);

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

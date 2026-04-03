/**
 * OpenAPI 3.0 spec for Estate Luxe API (Swagger UI).
 */
export const openapiSpec = {
  openapi: "3.0.3",
  info: {
    title: "Estate Luxe API",
    description: "REST API for tenants and health checks (Supabase backend).",
    version: "1.0.0",
  },
  servers: [
    { url: "/", description: "Current host" },
  ],
  tags: [
    { name: "Meta", description: "API info" },
    { name: "Health", description: "Service status" },
    { name: "Tenants", description: "Tenant records" },
  ],
  paths: {
    "/": {
      get: {
        tags: ["Meta"],
        summary: "API overview",
        operationId: "getRoot",
        responses: {
          200: {
            description: "JSON with API name and endpoint hints",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiOverview" },
              },
            },
          },
        },
      },
    },
    "/api/health": {
      get: {
        tags: ["Health"],
        summary: "Health check",
        description: "Returns whether the server is up and Supabase is configured.",
        operationId: "getHealth",
        responses: {
          200: {
            description: "OK",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/HealthResponse" },
              },
            },
          },
        },
      },
    },
    "/api/tenants": {
      get: {
        tags: ["Tenants"],
        summary: "List tenants",
        operationId: "listTenants",
        responses: {
          200: {
            description: "Array of tenant rows",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Tenant" },
                },
              },
            },
          },
          500: {
            description: "Database error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorBody" },
              },
            },
          },
          503: {
            description: "Supabase not configured",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorBody" },
              },
            },
          },
        },
      },
      post: {
        tags: ["Tenants"],
        summary: "Create tenant",
        operationId: "createTenant",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/TenantInput" },
            },
          },
        },
        responses: {
          200: {
            description: "Created tenant",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Tenant" },
              },
            },
          },
          400: {
            description: "Validation or insert error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorBody" },
              },
            },
          },
          503: {
            description: "Supabase not configured",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorBody" },
              },
            },
          },
        },
      },
    },
  },
  components: {
    schemas: {
      ApiOverview: {
        type: "object",
        properties: {
          name: { type: "string", example: "Estate Luxe API" },
          health: { type: "string", example: "/api/health" },
          endpoints: {
            type: "array",
            items: { type: "string" },
          },
        },
      },
      HealthResponse: {
        type: "object",
        properties: {
          ok: { type: "boolean", example: true },
          supabase: {
            type: "boolean",
            description: "Whether Supabase URL and service role key are set",
          },
        },
      },
      Tenant: {
        type: "object",
        description: "Row shape depends on your Supabase `tenants` table",
        additionalProperties: true,
      },
      TenantInput: {
        type: "object",
        description: "Fields to insert into `tenants` (must match table columns)",
        additionalProperties: true,
      },
      ErrorBody: {
        type: "object",
        properties: {
          error: { type: "string" },
        },
        required: ["error"],
      },
    },
  },
};

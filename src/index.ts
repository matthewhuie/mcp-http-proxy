import express, { Request, Response } from "express";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { z } from "zod";

const PORT = 8000;

const app = express();
app.use(express.json());

// Each POST creates a stateless transport + server instance.
app.post("/mcp", async (req: Request, res: Response) => {
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined, // stateless — no session tracking
  });

  const server = new McpServer({
    name: "http-proxy",
    version: "1.0.0",
  });

  server.registerTool(
    "http_get",
    {
      title: "HTTP GET",
      description: "Perform an HTTP GET request to the given URL and return the response status, headers, and body.",
      inputSchema: z.object({
        url: z.string().url().describe("The URL to fetch"),
      }),
    },
    async ({ url }) => {
      let response: globalThis.Response;
      try {
        response = await fetch(url);
      } catch (err) {
        return {
          isError: true,
          content: [
            {
              type: "text" as const,
              text: `Request failed: ${err instanceof Error ? err.message : String(err)}`,
            },
          ],
        };
      }

      const body = await response.text();
      const headers = Object.fromEntries(response.headers.entries());

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                status: response.status,
                statusText: response.statusText,
                headers,
                body,
              },
              null,
              2
            ),
          },
        ],
      };
    }
  );

  await server.connect(transport);
  await transport.handleRequest(req, res, req.body);
});

// SSE resumption and session termination are not supported in stateless mode.
app.get("/mcp", (_req: Request, res: Response) => {
  res.status(405).json({ error: "GET not supported in stateless mode" });
});

app.delete("/mcp", (_req: Request, res: Response) => {
  res.status(405).json({ error: "DELETE not supported in stateless mode" });
});

app.listen(PORT, () => {
  console.log(`MCP HTTP proxy server listening on http://localhost:${PORT}/mcp`);
});

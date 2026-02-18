# mcp-http-proxy
An MCP server that exposes a single `http_get` tool, allowing MCP clients to perform HTTP GET requests to arbitrary URLs and receive the response.

## Transport
Uses the [Streamable HTTP](https://modelcontextprotocol.io/specification/2025-03-26/basic/transports#streamable-http) MCP transport, listening on port **8000**. The server operates in stateless mode — no session is maintained between requests.

## Tool
### `http_get`
Performs an HTTP GET request to the provided URL.

**Input**
| Field | Type   | Description      |
|-------|--------|------------------|
| `url` | string | The URL to fetch |

**Output (JSON)**  
| Field        | Type   | Description                        |
|--------------|--------|------------------------------------|
| `status`     | number | HTTP response status code          |
| `statusText` | string | HTTP response status text          |
| `headers`    | object | Response headers as key/value pairs|
| `body`       | string | Response body as text              |

If the request fails (e.g. DNS error, connection refused), the tool returns an error result with a descriptive message.

## Requirements
- Node.js 18+

## Installation
```bash
npm install
```

## Usage
**Development** (runs directly with `tsx`, no compile step):

```bash
npm run dev
```

**Production** (compile then run):

```bash
npm run build
npm start
```

The server will print:

```
MCP HTTP proxy server listening on http://localhost:8000/mcp
```

## MCP Client Configuration
Point your MCP client at `http://localhost:8000/mcp`. For example, in a Claude Desktop `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "http-proxy": {
      "url": "http://localhost:8000/mcp"
    }
  }
}
```

## Project Structure
```
mcp-http-proxy/
├── src/
│   └── index.ts      # MCP server entry point
├── package.json
└── tsconfig.json
```

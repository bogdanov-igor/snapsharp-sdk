# snapsharp-mcp

Official MCP (Model Context Protocol) server for [SnapSharp](https://snapsharp.dev) — Screenshot & Monitoring API.

Allows Claude Desktop, Cursor, Windsurf, and any other MCP-compatible AI tool to take screenshots, generate OG images, run site audits, record videos, and more — as native AI tools.

## Available Tools

| Tool | Description |
|---|---|
| `snapsharp_screenshot` | Screenshot any URL |
| `snapsharp_og_image` | Generate OG images from templates |
| `snapsharp_html_to_image` | Render HTML/CSS to image |
| `snapsharp_site_audit` | Extract colors, fonts, tech stack, accessibility |
| `snapsharp_video` | Record webpages as MP4/WebM/GIF |
| `snapsharp_pdf` | Generate PDFs from URL, HTML, or templates |
| `snapsharp_batch_screenshot` | Batch screenshot up to 500 URLs |

## Prerequisites

Get your API key at [snapsharp.dev/dashboard/api-keys](https://snapsharp.dev/dashboard/api-keys).

## Installation

### Claude Desktop

Edit `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) or `%APPDATA%\Claude\claude_desktop_config.json` (Windows):

```json
{
  "mcpServers": {
    "snapsharp": {
      "command": "npx",
      "args": ["-y", "snapsharp-mcp"],
      "env": {
        "SNAPSHARP_API_KEY": "sk_live_your_key_here"
      }
    }
  }
}
```

Restart Claude Desktop. You'll see SnapSharp tools available in the tool selector.

### Cursor

Create or edit `.cursor/mcp.json` in your project (or `~/.cursor/mcp.json` globally):

```json
{
  "mcpServers": {
    "snapsharp": {
      "command": "npx",
      "args": ["-y", "snapsharp-mcp"],
      "env": {
        "SNAPSHARP_API_KEY": "sk_live_your_key_here"
      }
    }
  }
}
```

### Windsurf

Edit `~/.codeium/windsurf/mcp_config.json`:

```json
{
  "mcpServers": {
    "snapsharp": {
      "command": "npx",
      "args": ["-y", "snapsharp-mcp"],
      "env": {
        "SNAPSHARP_API_KEY": "sk_live_your_key_here"
      }
    }
  }
}
```

### Other MCP clients

```json
{
  "command": "npx",
  "args": ["-y", "snapsharp-mcp"],
  "env": {
    "SNAPSHARP_API_KEY": "sk_live_your_key_here"
  }
}
```

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `SNAPSHARP_API_KEY` | ✅ Yes | Your SnapSharp API key |
| `SNAPSHARP_BASE_URL` | No | Override API base URL (default: `https://api.snapsharp.dev`) |

## Usage Examples

Once configured, you can use natural language in your AI tool:

- *"Take a screenshot of https://stripe.com in dark mode"*
- *"Run a site audit on https://vercel.com and show me the color palette"*
- *"Screenshot https://github.com on an iPhone 14"*
- *"Record a 10-second video of https://framer.com"*
- *"Generate an OG image using the blog-post template with title 'My Article'"*
- *"Batch screenshot these 5 URLs: ..."*

## Plans

| Feature | Free | Starter | Growth | Business |
|---|---|---|---|---|
| Screenshots | ✅ | ✅ | ✅ | ✅ |
| Site Audit | ❌ | ✅ | ✅ | ✅ |
| OG Images | ❌ | ✅ | ✅ | ✅ |
| HTML to Image | ❌ | ✅ | ✅ | ✅ |
| Video Recording | ❌ | ❌ | ✅ | ✅ |
| PDF Generation | ❌ | ✅ | ✅ | ✅ |
| Batch Screenshots | ❌ | ✅ (10) | ✅ (50) | ✅ (100) |
| Stealth mode | ❌ | ❌ | ✅ | ✅ |

See full pricing at [snapsharp.dev/pricing](https://snapsharp.dev/pricing).

## Links

- [SnapSharp Dashboard](https://snapsharp.dev/dashboard)
- [API Documentation](https://snapsharp.dev/docs)
- [npm package](https://www.npmjs.com/package/snapsharp-mcp)
- [GitHub](https://github.com/bogdanov-igor/snapsharp-sdk)

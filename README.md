# SnapSharp SDKs

Official client libraries and integrations for the [SnapSharp](https://snapsharp.dev) Screenshot & OG Image API.

**API Docs:** [snapsharp.dev/docs](https://snapsharp.dev/docs)  
**Get an API key:** [snapsharp.dev](https://snapsharp.dev)

---

## Available Packages

| Package | Directory | Registry | Install |
|---------|-----------|----------|---------|
| Node.js SDK | [sdk-node/](sdk-node/) | [npm](https://www.npmjs.com/package/@snapsharp/sdk) | `npm install @snapsharp/sdk` |
| Python SDK | [sdk-python/](sdk-python/) | [PyPI](https://pypi.org/project/snapsharp/) | `pip install snapsharp` |
| Ruby SDK | [sdk-ruby/](sdk-ruby/) | [RubyGems](https://rubygems.org/gems/snapsharp) | `gem install snapsharp` |
| PHP SDK | [sdk-php/](sdk-php/) | [Packagist](https://packagist.org/packages/snapsharp/sdk) | `composer require snapsharp/sdk` |
| Go SDK | [sdk-go/](sdk-go/) | [pkg.go.dev](https://pkg.go.dev/github.com/bogdanov-igor/snapsharp-sdk/sdk-go) | `go get github.com/bogdanov-igor/snapsharp-sdk/sdk-go` |
| MCP Server | [mcp/](mcp/) | [npm](https://www.npmjs.com/package/snapsharp-mcp) | `npx snapsharp-mcp` |
| n8n Node | [n8n/](n8n/) | [npm](https://www.npmjs.com/package/n8n-nodes-snapsharp) | Install via n8n community nodes |

---

## Quick Start

```bash
# Node.js
npm install @snapsharp/sdk
```

```ts
import { SnapSharp } from '@snapsharp/sdk';

const snap = new SnapSharp(process.env.SNAPSHARP_API_KEY);

const image = await snap.screenshot({ url: 'https://example.com' });
```

See each package's README for language-specific examples.

---

## MCP Server (for Claude / Cursor / Windsurf)

Use SnapSharp directly from AI assistants via the [Model Context Protocol](mcp/):

```json
{
  "mcpServers": {
    "snapsharp": {
      "command": "npx",
      "args": ["snapsharp-mcp"],
      "env": { "SNAPSHARP_API_KEY": "sk_live_..." }
    }
  }
}
```

Once configured, you can say:
- *"Take a screenshot of https://stripe.com in dark mode"*
- *"Generate an OG image for my blog post"*
- *"Run a site audit on https://vercel.com"*

---

## n8n Integration

Install the [n8n community node](n8n/) to use SnapSharp in your n8n workflows.  
Search for `n8n-nodes-snapsharp` in the n8n community nodes panel.

---

## Support

- **Docs:** [snapsharp.dev/docs](https://snapsharp.dev/docs)
- **Issues:** [github.com/bogdanov-igor/snapsharp-sdk/issues](https://github.com/bogdanov-igor/snapsharp-sdk/issues)
- **Email:** support@snapsharp.dev

---

## License

MIT

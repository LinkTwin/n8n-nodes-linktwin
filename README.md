# n8n-nodes-linktwin

This is an n8n community node for [LinkTwin App Deep Linking](https://linktw.in) — turn any link into a smart deep link that opens directly in the right app (YouTube, Amazon, Spotify & 100+ apps) or in the user's external browser (Safari, Chrome, etc.), bypassing clunky in-app browsers and boosting clicks and conversions.

## Features

- **Create Deep Links** - Turn any URL into a smart deep link with custom aliases, tracking pixels, and metadata
- **Get Link Details** - Retrieve full information about any deep link
- **List/Search Links** - Filter and paginate through your deep links
- **Update Links** - Modify destinations, settings, and metadata
- **Delete Links** - Remove unwanted deep links
- **Get Statistics** - Pull detailed click analytics with geo, device, browser, and referrer data

## Installation

### Community Nodes (Recommended)

1. Go to **Settings > Community Nodes**
2. Select **Install**
3. Enter `n8n-nodes-linktwin` and click **Install**

### Manual Installation

```bash
cd ~/.n8n/nodes
npm install n8n-nodes-linktwin
```

Then restart n8n.

## Credentials

1. Log in to [LinkTwin](https://linktw.in)
2. Go to **Settings** → **Developer API Key**
3. Copy your API key
4. In n8n, create a new **LinkTwin API** credential
5. Paste your API key and save

## Operations

### Deep Links

| Operation | Description |
|-----------|-------------|
| **Create** | Turn any URL into a smart deep link |
| **Get** | Get details of a specific link by ID or short URL |
| **List** | List all links with optional filters |
| **Update** | Update an existing link |
| **Delete** | Permanently delete a link |

### Statistics

| Operation | Description |
|-----------|-------------|
| **Get** | Get click statistics for a link (clicks, geo, devices, referrers) |

## Example Workflows

### Auto-create links from new content
```
[Trigger: New Blog Post] → [LinkTwin: Create] → [Slack: Send Message with Short URL]
```

### Weekly analytics report
```
[Schedule: Every Monday] → [LinkTwin: List Links] → [LinkTwin: Get Statistics] → [Email: Send Report]
```

### Bulk link management
```
[Google Sheets: Get Rows] → [LinkTwin: Create] → [Google Sheets: Update with Short URLs]
```

## Dynamic Dropdowns

When creating or updating links, the node provides dynamic dropdowns for:

- **Collections** - Your link organization folders
- **Domains** - Your branded domains (e.g., linktw.in, custom domains)
- **Tracking Pixels** - Facebook, Google, TikTok pixels, etc.

## Resources

- [LinkTwin Website](https://linktw.in)
- [LinkTwin API Documentation](https://linktw.in/developers)
- [n8n Community Nodes Documentation](https://docs.n8n.io/integrations/community-nodes/)

## License

MIT

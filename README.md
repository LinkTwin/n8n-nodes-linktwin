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

## Create & Update Fields

When creating or updating a deep link, you can configure the following fields:

### Basic

| Field | Description |
|-------|-------------|
| **Destination URL** | The URL to turn into a smart deep link (required for create) |
| **Custom Alias** | Custom slug for the short URL (e.g., `my-campaign` creates `linktw.in/my-campaign`) |
| **Domain** | Branded domain to use instead of the default `linktw.in` |
| **Collections** | Organize links into folders/groups |
| **Tracking Pixels** | Attach Facebook, Google, TikTok, or GTM pixels for conversion tracking |
| **Display Title** | Custom title shown on your LinkTwin dashboard (does not affect the link preview) |
| **Internal Note** | Private note only visible to you |

### Link Protection & Expiration

| Field | Description |
|-------|-------------|
| **Password** | Require a password before redirecting |
| **Click Limit** | Automatically expire the link after a set number of clicks |
| **Expiry Date** | Set a date and time when the link stops working |
| **Expiration Redirect** | URL to redirect visitors to after the link expires |

### Social Sharing (Meta Tags)

Override the link preview that appears when shared on social media or messaging apps:

| Field | Description |
|-------|-------------|
| **Custom Title** | Override the og:title for social previews |
| **Custom Description** | Override the og:description |
| **Custom Image URL** | Override the og:image (preview thumbnail) |

### Targeting

#### Device Targeting

Send users to different URLs based on their device:

| Field | Description |
|-------|-------------|
| **Device** | Target device: iPhone, iPad, Android, Windows Phone |
| **Redirect URL** | URL to redirect users on that device |

You can add multiple device targets. Users on non-targeted devices go to the default destination.

#### Geo Targeting

Redirect users based on their country:

| Field | Description |
|-------|-------------|
| **Country** | Two-letter country code (e.g., `US`, `DE`, `JP`) |
| **Redirect URL** | URL to redirect users from that country |

You can add multiple geo targets. Users from non-targeted countries go to the default destination.

#### Language Targeting

Redirect users based on their browser language:

| Field | Description |
|-------|-------------|
| **Language** | Two-letter language code (e.g., `en`, `de`, `fr`) |
| **Redirect URL** | URL to redirect users with that browser language |

#### A/B Testing

Split traffic between two URL variants to test which performs better:

| Field | Description |
|-------|-------------|
| **Variant A URL** | First URL variant |
| **Variant B URL** | Second URL variant |

Traffic is split evenly between the variants. Use the Statistics operation to compare performance.

#### Custom Parameters

Append query parameters to the destination URL:

| Field | Description |
|-------|-------------|
| **Parameter Name** | e.g., `utm_source`, `utm_campaign`, `ref` |
| **Parameter Value** | e.g., `newsletter`, `spring-sale`, `partner123` |

## Example Workflows

### Auto-create deep links from new content
```
[Trigger: New Blog Post] → [LinkTwin: Create] → [Slack: Send Short URL]
```
Automatically generate a deep link whenever you publish, and share it with your team.

### Weekly analytics dashboard
```
[Schedule: Every Monday] → [LinkTwin: List] → [LinkTwin: Get Statistics] → [Google Sheets: Append Row]
```
Build a spreadsheet of click stats across all your links, refreshed weekly.

### Bulk link creation from a spreadsheet
```
[Google Sheets: Get Rows] → [LinkTwin: Create] → [Google Sheets: Update Row with Short URL]
```
Import a list of URLs, create deep links for each, and write the short URLs back.

### Geo-targeted app download links
```
[Webhook: Receive Request] → [LinkTwin: Create with Device Targeting] → [Respond with Short URL]
```
Create a single link that sends iOS users to the App Store, Android users to the Play Store, and desktop users to your website.

### A/B test landing pages
```
[Form Trigger] → [LinkTwin: Create with A/B Testing] → [Wait 7 days] → [LinkTwin: Get Statistics] → [IF: Compare Clicks] → [Slack: Send Winner]
```
Create an A/B link, wait a week, then automatically report which variant got more clicks.

### Expiring promo links for flash sales
```
[Schedule: Sale Start] → [LinkTwin: Create with Expiry + Redirect] → [Email: Send Promo]
```
Create a link that expires after 24 hours and redirects to a "sale ended" page afterward.

### Multi-language campaign
```
[HTTP Request: Get Campaign Data] → [LinkTwin: Create with Language Targeting] → [Database: Store Links]
```
Create one link that redirects German users to `/de`, French users to `/fr`, and everyone else to `/en`.

### Influencer campaign tracker
```
[Google Sheets: Get Influencers] → [LinkTwin: Create with Custom Alias per Influencer] → [Schedule: Weekly] → [LinkTwin: Get Statistics] → [Google Sheets: Update Stats]
```
Give each influencer a branded link (e.g., `linktw.in/sarah`, `linktw.in/mike`), then automatically pull click stats into a shared spreadsheet.

### Clean up expired links
```
[Schedule: Daily] → [LinkTwin: List] → [IF: Expired] → [LinkTwin: Delete] → [Slack: Notify]
```
Automatically find and delete links past their expiry date, and notify your team.

## Dynamic Dropdowns

When creating or updating links, the node provides dynamic dropdowns for:

- **Collections** - Your link organization folders (accepts names or IDs)
- **Domains** - Your branded domains (e.g., linktw.in, custom domains)
- **Tracking Pixels** - Facebook, Google, TikTok, GTM pixels (accepts names or IDs)

## Resources

- [LinkTwin Website](https://linktw.in)
- [LinkTwin API Documentation](https://linktw.in/developers)
- [n8n Community Nodes Documentation](https://docs.n8n.io/integrations/community-nodes/)

## License

MIT

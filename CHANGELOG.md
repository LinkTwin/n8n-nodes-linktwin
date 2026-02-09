# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.4] - 2026-02-09

### Added
- **Geo Targeting** - Redirect users to different URLs based on their country
- **Device Targeting** - Redirect users to different URLs based on their device type
- **Language Targeting** - Redirect users to different URLs based on their browser language
- **A/B Testing** - Split traffic between multiple destination URLs by percentage
- **Custom Parameters** - Append query parameters to destination URL on redirect
- **Timezone support** for List and Get operations
- **Date (Default)** sort order option for List operation

### Fixed
- API error check now handles string `"0"` responses (loose equality)
- Collections filter now sends JSON array format instead of comma-separated values

### Changed
- Test suite now uses environment variables instead of hardcoded API keys

## [1.0.3] - 2026-02-06

### Changed
- Refreshed all marketing copy and descriptions to align with LinkTwin website messaging
- Updated node description to emphasize smart deep linking and external browser support
- Renamed "Statistic" resource to "Statistics" (plural)
- Replaced "URL shortener" positioning with "smart deep link" messaging throughout
- Updated Destination URL field description to reflect deep linking value proposition
- Updated npm keywords: removed `url-shortener`, added `deep-linking`, `app-deep-linking`, `app-opener`

## [1.0.2] - 2026-01-15

### Added
- **Domain field in Update operation** - You can now change the branded domain when updating a link
- Comprehensive test suite covering all 64 operations and edge cases

### Fixed
- ESLint configuration created (was missing)
- Changed error handling to use `ApplicationError` instead of generic `Error` for better n8n integration
- Fixed alphabetical ordering of options in Additional Fields and Update Fields
- Fixed Sort Order and Date Range option ordering

### Changed
- Updated lint scripts in package.json for correct file patterns

## [1.0.1] - 2026-01-14

### Added
- `display_title` field to Create and Update operations
- Display title allows organizing links in dashboard without affecting og:title

## [1.0.0] - 2026-01-13

### Added
- Initial release
- **Deep Link Operations:**
  - Create - Turn any URL into a smart deep link with custom aliases, domains, collections, pixels, password protection, expiration settings, click limits, and social meta tags
  - Get - Retrieve details of a specific link by ID or short URL
  - List - List all links with pagination, sorting, and filtering
  - Update - Modify existing links (destination URL, settings, metadata)
  - Delete - Permanently remove links
- **Statistics Operations:**
  - Get - Retrieve click analytics with geo, device, browser, and referrer data
- **Dynamic Dropdowns:**
  - Collections - User's link organization folders
  - Domains - User's branded domains
  - Pixels - Tracking pixels (Facebook, Google, TikTok, etc.)
- "Return All" pagination support for List operation
- Error handling with `continueOnFail` support
- Full feature parity with Make.com integration

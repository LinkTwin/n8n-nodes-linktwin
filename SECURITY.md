# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Reporting a Vulnerability

We take security seriously. If you discover a security vulnerability in this project, please report it responsibly.

### How to Report

**Please do NOT open a public GitHub issue for security vulnerabilities.**

Instead, please email us at: **support@linktw.in**

Include the following in your report:

1. Description of the vulnerability
2. Steps to reproduce
3. Potential impact
4. Any suggested fixes (optional)

### What to Expect

- **Acknowledgment**: We will acknowledge receipt within 48 hours
- **Initial Assessment**: We will provide an initial assessment within 1 week
- **Resolution Timeline**: We aim to resolve critical issues within 30 days
- **Disclosure**: We will coordinate with you on public disclosure timing

### Scope

This security policy covers:

- The `n8n-nodes-linktwin` npm package
- Code in this repository

This policy does NOT cover:

- The LinkTwin API service (report to support@linktw.in separately)
- n8n core application (report to n8n directly)
- Third-party dependencies (report to respective maintainers)

## Security Best Practices for Users

When using this node:

1. **Protect your API key**: Never commit your LinkTwin API key to version control
2. **Use n8n credentials**: Always store your API key in n8n's credential system
3. **Limit permissions**: Use API keys with minimal required permissions
4. **Monitor usage**: Regularly review your LinkTwin dashboard for unusual activity

## Dependencies

We regularly update dependencies to address known vulnerabilities. Run `npm audit` to check for known issues in dependencies.

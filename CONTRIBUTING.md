# Contributing to n8n-nodes-linktwin

Thank you for your interest in contributing to the LinkTwin n8n community node! This document provides guidelines for contributing.

## Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/linktwin/n8n-nodes-linktwin.git
   cd n8n-nodes-linktwin
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Build the project**
   ```bash
   npm run build
   ```

4. **Run linting**
   ```bash
   npm run lint
   ```

## Project Structure

```
├── credentials/          # API credential definitions
├── nodes/LinkTwin/       # Main node implementation
├── icons/                # SVG icons for credentials
├── test/                 # Comprehensive test suite
└── dist/                 # Compiled output (generated)
```

## Making Changes

### Code Style

- Follow TypeScript best practices
- Use the existing code style (enforced by ESLint and Prettier)
- Run `npm run format` before committing
- Run `npm run lint` to check for issues

### Testing

Before submitting a PR, ensure:

1. The project builds without errors: `npm run build`
2. Linting passes: `npm run lint`
3. If you have API access, run the test suite: `node test/comprehensive-test.js`

### Commit Messages

Use clear, descriptive commit messages:

- `feat: add new operation for X`
- `fix: resolve issue with Y`
- `docs: update README with Z`
- `refactor: improve error handling`

## Submitting a Pull Request

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Make your changes
4. Run build and lint checks
5. Commit your changes with a clear message
6. Push to your fork
7. Open a Pull Request against `main`

## Reporting Issues

When reporting issues, please include:

- n8n version
- Node.js version
- Steps to reproduce
- Expected vs actual behavior
- Any error messages

## Questions?

- Open a [GitHub Issue](https://github.com/linktwin/n8n-nodes-linktwin/issues)
- Email: support@linktw.in

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

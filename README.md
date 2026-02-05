# CSP Generator

A web application that crawls websites and generates Content Security Policy (CSP) headers based on the resources loaded.

## Prerequisites

**Node.js v24.13.0** (or v18+) and **npm 11.6.2** (or v8+)

> ⚠️ **Important**: This application requires Node.js v18 or higher. The system currently shows Node v12.22.9 which is not compatible.

## Quick Start

### 1. Switch to Node v24

If you have Node v24.13.0 installed, switch to it:

```bash
# Using nvm
nvm use 24

# Using fnm
fnm use 24

# Verify
node -v  # Should show v24.13.0
```

### 2. Run Setup Script

```bash
./setup.sh
```

This will install all dependencies and Playwright browsers.

### 3. Start the Application

**Terminal 1 - Start Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 - Start Frontend:**
```bash
cd client
npm run dev
```

### 4. Open in Browser

Navigate to `http://localhost:5173`

## Manual Installation

If the setup script doesn't work, install manually:

### Server Setup

```bash
cd server
npm install
npx playwright install chromium
npm run dev
```

### Client Setup

```bash
cd client
npm install
npm run dev
```

## Features

- **Resource Crawling**: Uses Playwright to accurately detect all loaded resources.
- **Same-Origin Detection**: Automatically identifies same-origin resources and uses the `'self'` keyword.
- **Directive Optimization**: Ensures `'self'` is present in all populated directives to prevent functional issues.
- **Wildcard Subdomain Support**: Optionally uses wildcards for common services (Google Analytics, GTM, Hotjar, etc.) to keep policies clean.
- **Smart Deduplication**: Automatically deduplicates redundant origins and sorts directives for readability.
- **Responsive UI**: Modern dark theme with real-time status updates and copy-to-clipboard functionality.

## Usage

1. Open your browser to `http://localhost:5173`
2. Enter a URL (e.g., `https://example.com`)
3. **Toggle Wildcards**: Choose whether to use wildcards for common third-party services.
4. Click "Generate CSP"
5. The application will crawl the site and display the generated CSP header
6. Click "Copy to Clipboard" to copy the CSP header

## How It Works

- **Backend**: Uses Playwright to launch a headless Chromium browser, intercepts network requests, and categorizes resources by type. It maps subdomains of popular services to wildcard patterns (e.g., `*.googletagmanager.com`).
- **CSP Logic**:
    - Automatically handles `'self'` for the base domain.
    - Prevents directive overrides by ensuring `'self'` is present in any directive that includes external sources.
    - Deduplicates sources and sorts them (special keywords like `'self'` and `data:` always appear first).
- **Frontend**: Modern React interface built with Vanilla CSS, featuring smooth transitions and error handling.

## Project Structure

```
csp-generator/
├── server/           # Express + Playwright backend
│   ├── index.ts      # API server
│   ├── crawler.ts    # Crawling logic
│   └── package.json
├── client/           # React + Vite frontend
│   ├── src/
│   │   ├── App.tsx   # Main component
│   │   ├── main.tsx  # Entry point
│   │   └── index.css # Styles
│   └── package.json
├── setup.sh          # Automated setup script
└── README.md
```

## API Endpoints

### POST `/api/generate-csp`

Generates a CSP header for the provided URL.

**Request Body:**
```json
{
  "url": "https://example.com",
  "useWildcards": true
}
```

- `url` (string): The URL to crawl.
- `useWildcards` (boolean, optional): Default `true`. If enabled, uses wildcard subdomains for common services.

**Response:**
```json
{
  "csp": "default-src 'self'; script-src 'self' https://*.googletagmanager.com; ..."
}
```

## Troubleshooting

### Node Version Issues

If you see syntax errors or engine warnings:

1. Check your Node version: `node -v`
2. It should be v18 or higher (v24.13.0 recommended)
3. Use `nvm` or `fnm` to switch versions

### Playwright Installation

If Playwright fails to install:

```bash
cd server
npx playwright install chromium --with-deps
```

### Port Already in Use

If port 3000 or 5173 is already in use, you can change them:

- **Server**: Edit `server/index.ts` and change `PORT = 3000`
- **Client**: Edit `client/vite.config.ts` and add server port config

## License

ISC

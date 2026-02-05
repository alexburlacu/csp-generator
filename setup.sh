#!/bin/bash

echo "CSP Generator - Setup Script"
echo "=============================="
echo ""

# Check current Node version
CURRENT_NODE=$(node -v)
echo "Current Node version: $CURRENT_NODE"

# Check if we need to switch versions
if [[ ! "$CURRENT_NODE" =~ ^v(18|20|22|24) ]]; then
    echo ""
    echo "⚠️  Node version $CURRENT_NODE is not supported."
    echo "This application requires Node.js v18 or higher (v24.13.0 recommended)"
    echo ""
    echo "Please switch to Node v24 using one of these methods:"
    echo ""
    echo "If using nvm:"
    echo "  nvm use 24"
    echo "  # or install it first: nvm install 24"
    echo ""
    echo "If using fnm:"
    echo "  fnm use 24"
    echo "  # or install it first: fnm install 24"
    echo ""
    echo "Then run this script again."
    exit 1
fi

echo "✓ Node version is compatible"
echo ""

# Install server dependencies
echo "Installing server dependencies..."
cd server
rm -rf node_modules package-lock.json
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install server dependencies"
    exit 1
fi

echo "✓ Server dependencies installed"
echo ""

# Install Playwright browsers
echo "Installing Playwright Chromium browser..."
npx playwright install chromium

if [ $? -ne 0 ]; then
    echo "❌ Failed to install Playwright browsers"
    exit 1
fi

echo "✓ Playwright browser installed"
echo ""

# Install client dependencies
echo "Installing client dependencies..."
cd ../client
rm -rf node_modules package-lock.json
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install client dependencies"
    exit 1
fi

echo "✓ Client dependencies installed"
echo ""

echo "=============================="
echo "✓ Setup complete!"
echo ""
echo "To start the application:"
echo ""
echo "Terminal 1 (Server):"
echo "  cd server && npm run dev"
echo ""
echo "Terminal 2 (Client):"
echo "  cd client && npm run dev"
echo ""
echo "Then open http://localhost:5173 in your browser"
echo "=============================="

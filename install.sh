#!/bin/bash

# This script should be run in a terminal where you've already run: nvm use 24

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

echo "Installing Playwright Chromium browser..."
npx playwright install chromium

if [ $? -ne 0 ]; then
    echo "❌ Failed to install Playwright browsers"
    exit 1
fi

echo "✓ Playwright browser installed"
echo ""

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

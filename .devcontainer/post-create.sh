#!/bin/bash

set -e

echo "Installing dependencies..."
pnpm install

# Install Playwright browsers (if using Playwright)
if grep -q "playwright" package.json 2>/dev/null; then
  echo "Installing Playwright browsers..."
  npx playwright install --with-deps chromium
fi

echo "Setup complete!"

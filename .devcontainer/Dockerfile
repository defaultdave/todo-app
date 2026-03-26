FROM node:22-bookworm

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Install common tools
RUN apt-get update && apt-get install -y \
    git \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Playwright browsers
RUN npx playwright install --with-deps chromium

WORKDIR /workspace

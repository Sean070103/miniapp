# Environment Setup Guide

## Fix for "Origin http://localhost:3000 not found on Allowlist" Error

### 1. Create .env.local file

Create a `.env.local` file in your project root with the following content:

```env
# UploadThing Configuration
UPLOADTHING_SECRET=sk_live_7c71a8250032266a66bc575712f3b12be9846e76885e8a339ce8c9482f7c428e
UPLOADTHING_APP_ID=1bdtz544ed

# Database Configuration
DATABASE_URL="mongodb+srv://admin:admin@cluster0.mongodb.net/dailybase?retryWrites=true&w=majority"

# WalletConnect Configuration
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=c4f79cc821944d9680842e34466bfbd9

# App Configuration
NEXT_PUBLIC_URL=http://localhost:3000
NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME=DailyBase
NEXT_PUBLIC_APP_SUBTITLE=Your Daily Web3 Life Log on Base
NEXT_PUBLIC_APP_DESCRIPTION=Track your daily crypto activities on Base. Build streaks, reflect on your journey, and maintain your Web3 life log.
NEXT_PUBLIC_APP_ICON=http://localhost:3000/favicon.svg
NEXT_PUBLIC_APP_SPLASH_IMAGE=http://localhost:3000/splash.png
NEXT_PUBLIC_SPLASH_BACKGROUND_COLOR=#000000
NEXT_PUBLIC_APP_PRIMARY_CATEGORY=social
NEXT_PUBLIC_APP_HERO_IMAGE=http://localhost:3000/og-image.png
NEXT_PUBLIC_APP_TAGLINE=Track your crypto journey daily
NEXT_PUBLIC_APP_OG_TITLE=DailyBase - Your Daily Web3 Life Log
NEXT_PUBLIC_APP_OG_DESCRIPTION=Track your daily crypto activities on Base. Build streaks, reflect on your journey, and maintain your Web3 life log.
NEXT_PUBLIC_APP_OG_IMAGE=http://localhost:3000/og-image.png

# CDP Client API Key (if needed)
NEXT_PUBLIC_CDP_CLIENT_API_KEY=

# Farcaster Configuration (if needed)
FARCASTER_HEADER=
FARCASTER_PAYLOAD=
FARCASTER_SIGNATURE=

# API Keys (optional)
NEXT_PUBLIC_EXCHANGE_RATE_API_KEY=
NEXT_PUBLIC_FIXER_API_KEY=
NEXT_PUBLIC_BASESCAN_API_KEY=
```

### 2. Fix UploadThing Configuration

The UploadThing configuration has been updated to handle localhost development. If you're still getting the error, you need to:

1. Go to [cloud.reown.com](https://cloud.reown.com)
2. Log in to your UploadThing account
3. Find your app configuration
4. Add `http://localhost:3000` to the allowed origins list

### 3. Restart Development Server

After creating the `.env.local` file:

```bash
# Stop the current dev server (Ctrl+C)
# Then restart it
pnpm dev
```

### 4. Alternative: Disable UploadThing for Development

If you want to temporarily disable UploadThing to focus on other features, you can comment out the image upload functionality in the dashboard component.

### 5. Check for Other Issues

If the UI is still broken after these changes:

1. Check the browser console for any JavaScript errors
2. Make sure all dependencies are installed: `pnpm install`
3. Clear the browser cache and reload
4. Check if the database connection is working

### 6. Database Setup

Make sure your MongoDB database is properly configured and accessible. You can test the connection by visiting:
`http://localhost:3000/api/test-db`

## Quick Fix Commands

```bash
# Create .env.local file (Windows PowerShell)
@"
# UploadThing Configuration
UPLOADTHING_SECRET=sk_live_7c71a8250032266a66bc575712f3b12be9846e76885e8a339ce8c9482f7c428e
UPLOADTHING_APP_ID=1bdtz544ed
NEXT_PUBLIC_URL=http://localhost:3000
NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME=DailyBase
DATABASE_URL="mongodb+srv://admin:admin@cluster0.mongodb.net/dailybase?retryWrites=true&w=majority"
"@ | Out-File -FilePath .env.local -Encoding UTF8

# Restart dev server
pnpm dev
```

This should resolve both the UploadThing error and the UI issues.

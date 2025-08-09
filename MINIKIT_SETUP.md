# MiniKit Integration Setup for DailyBase

This guide helps you complete the MiniKit integration for your DailyBase application.

## ✅ Completed Steps

1. ✅ Installed `@coinbase/onchainkit` dependency
2. ✅ Created `MiniKitProvider` component
3. ✅ Updated `app/layout.tsx` with MiniKit provider and Farcaster metadata
4. ✅ Updated `app/page.tsx` with MiniKit hooks and frame readiness
5. ✅ Created `app/.well-known/farcaster.json/route.ts` for Farcaster manifest

## 🔧 Required Environment Variables

Add these environment variables to your `.env.local` file:

```bash
# Required Variables
NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME=DailyBase
NEXT_PUBLIC_URL=https://your-domain.com
NEXT_PUBLIC_CDP_CLIENT_API_KEY=your_cdp_api_key_here
FARCASTER_HEADER=your_farcaster_header_here
FARCASTER_PAYLOAD=your_farcaster_payload_here
FARCASTER_SIGNATURE=your_farcaster_signature_here

# Optional Variables
NEXT_PUBLIC_APP_ICON=https://your-domain.com/favicon.svg
NEXT_PUBLIC_APP_SUBTITLE=Your Daily Web3 Life Log on Base
NEXT_PUBLIC_APP_DESCRIPTION=Track your daily crypto activities on Base. Build streaks, reflect on your journey, and maintain your Web3 life log.
NEXT_PUBLIC_APP_SPLASH_IMAGE=https://your-domain.com/splash.png
NEXT_PUBLIC_SPLASH_BACKGROUND_COLOR=#000000
NEXT_PUBLIC_APP_PRIMARY_CATEGORY=social
NEXT_PUBLIC_APP_HERO_IMAGE=https://your-domain.com/og-image.png
NEXT_PUBLIC_APP_TAGLINE=Track your crypto journey daily
NEXT_PUBLIC_APP_OG_TITLE=DailyBase - Your Daily Web3 Life Log
NEXT_PUBLIC_APP_OG_DESCRIPTION=Track your daily crypto activities on Base. Build streaks, reflect on your journey, and maintain your Web3 life log.
NEXT_PUBLIC_APP_OG_IMAGE=https://your-domain.com/og-image.png
```

## 🚀 Next Steps

### 1. Get CDP API Key
1. Sign up for [Coinbase Developer Platform](https://portal.cdp.coinbase.com/)
2. Create a new project
3. Get your API key from the dashboard

### 2. Generate Farcaster Manifest
Run this command to generate your Farcaster account association credentials:

```bash
npx create-onchain --manifest
```

This will:
- Connect your Farcaster custody wallet
- Add your deployed URL
- Sign the manifest
- Update your local `.env` file with the generated credentials

### 3. Deploy and Test
1. Deploy your app to a public HTTPS domain (e.g., Vercel)
2. Update environment variables on your deployment platform
3. Test the manifest endpoint: `https://your-domain.com/.well-known/farcaster.json`
4. Share your app URL in Farcaster to test the integration

## 🎯 What This Enables

With MiniKit integrated, your DailyBase app now:

- ✅ **Farcaster Integration**: Users can launch your app directly from Farcaster posts
- ✅ **Frame Support**: Your app appears as an interactive frame in Farcaster
- ✅ **Account Association**: Users can associate their Farcaster account with your app
- ✅ **Social Features**: Built-in social features like notifications and profile viewing
- ✅ **Mini App Experience**: Optimized for the Farcaster Mini App experience

## 🔍 Testing

1. **Local Testing**: Run `npm run dev` and test the frame readiness
2. **Manifest Testing**: Visit `http://localhost:3000/.well-known/farcaster.json`
3. **Deployment Testing**: Deploy and test the live manifest endpoint
4. **Farcaster Testing**: Share your app URL in Farcaster and test the launch experience

## 📚 Additional Resources

- [MiniKit Documentation](https://docs.onchainkit.com/minikit)
- [Farcaster Mini Apps Guide](https://docs.farcaster.xyz/developers/mini-apps)
- [Coinbase Developer Platform](https://portal.cdp.coinbase.com/)

## 🆘 Troubleshooting

If you encounter issues:

1. **Check Environment Variables**: Ensure all required variables are set
2. **Verify HTTPS**: Your app must be deployed with HTTPS
3. **Test Manifest**: Ensure the Farcaster manifest endpoint returns valid JSON
4. **Check Console**: Look for any errors in the browser console
5. **Validate Frame**: Use the [Farcaster Manifest Validator](https://farcaster.xyz/~/developers/mini-apps/manifest)

## 🎉 Success!

Once completed, your DailyBase app will be a fully integrated Farcaster Mini App that users can discover, launch, and interact with directly from Farcaster!

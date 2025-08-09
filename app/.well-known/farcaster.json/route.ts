function withValidProperties(
  properties: Record<string, undefined | string | string[]>,
) {
  return Object.fromEntries(
    Object.entries(properties).filter(([key, value]) => {
      if (Array.isArray(value)) {
        return value.length > 0;
      }
      return !!value;
    }),
  );
}

export async function GET() {
  const URL = process.env.NEXT_PUBLIC_URL || 'https://your-domain.com';

  return Response.json({
    accountAssociation: {
      header: process.env.FARCASTER_HEADER,
      payload: process.env.FARCASTER_PAYLOAD,
      signature: process.env.FARCASTER_SIGNATURE,
    },
    frame: withValidProperties({
      version: "1",
      name: process.env.NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME || 'DailyBase',
      subtitle: process.env.NEXT_PUBLIC_APP_SUBTITLE || 'Your Daily Web3 Life Log on Base',
      description: process.env.NEXT_PUBLIC_APP_DESCRIPTION || 'Track your daily crypto activities on Base. Build streaks, reflect on your journey, and maintain your Web3 life log.',
      screenshotUrls: [],
      iconUrl: process.env.NEXT_PUBLIC_APP_ICON || `${URL}/favicon.svg`,
      splashImageUrl: process.env.NEXT_PUBLIC_APP_SPLASH_IMAGE || `${URL}/splash.png`,
      splashBackgroundColor: process.env.NEXT_PUBLIC_SPLASH_BACKGROUND_COLOR || "#000000",
      homeUrl: URL,
      webhookUrl: `${URL}/api/webhook`,
      primaryCategory: process.env.NEXT_PUBLIC_APP_PRIMARY_CATEGORY || "social",
      tags: [],
      heroImageUrl: process.env.NEXT_PUBLIC_APP_HERO_IMAGE || `${URL}/og-image.png`,
      tagline: process.env.NEXT_PUBLIC_APP_TAGLINE || 'Track your crypto journey daily',
      ogTitle: process.env.NEXT_PUBLIC_APP_OG_TITLE || 'DailyBase - Your Daily Web3 Life Log',
      ogDescription: process.env.NEXT_PUBLIC_APP_OG_DESCRIPTION || 'Track your daily crypto activities on Base. Build streaks, reflect on your journey, and maintain your Web3 life log.',
      ogImageUrl: process.env.NEXT_PUBLIC_APP_OG_IMAGE || `${URL}/og-image.png`,
      // use only while testing
      "noindex": true
    }),
  });
}

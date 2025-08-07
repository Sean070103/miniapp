# CryptoJournal

Your Web3 Life Log on Base - A beautiful, modern journaling app for tracking your crypto journey.

## Features

- **Rich Journaling**: Log events, transactions, learnings, and reflections
- **Calendar & Streaks**: Build consistency with daily entries and visual tracking
- **Base Identity**: Connect your Base wallet as your identity
- **Beautiful UI**: Modern design with gradients and animations
- **Responsive**: Works perfectly on desktop and mobile

## Tech Stack

- **Next.js 14** with App Router
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Radix UI** for accessible components
- **Lucide React** for icons
- **React Hook Form** for form handling
- **Zod** for validation
- **RainbowKit** for wallet connection
- **wagmi** for Ethereum interactions
- **Base Account SDK** for Base identity

## Project Structure

```
miniapp/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout with metadata
│   ├── page.tsx           # Main page component
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── landing/          # Landing page components
│   │   ├── header.tsx
│   │   ├── hero-section.tsx
│   │   ├── features-section.tsx
│   │   ├── activity-types.tsx
│   │   ├── cta-section.tsx
│   │   ├── animated-background.tsx
│   │   └── landing-page.tsx
│   ├── auth/             # Authentication components
│   │   ├── connect-wallet.tsx
│   │   └── user-profile.tsx
│   ├── providers/        # Context providers
│   │   └── wallet-provider.tsx
│   ├── ui/               # Reusable UI components
│   ├── dashboard.tsx     # Main dashboard
│   └── ...
├── contexts/             # React contexts
│   └── auth-context.tsx  # Authentication context
├── lib/                  # Utility functions
├── hooks/                # Custom React hooks
└── public/               # Static assets
```

## Getting Started

1. **Install dependencies**:
   ```bash
   pnpm install
   ```

2. **Run the development server**:
   ```bash
   pnpm dev
   ```

3. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## Development

- **Build for production**: `pnpm build`
- **Start production server**: `pnpm start`
- **Run linting**: `pnpm lint`

## Key Components

### Landing Page
The landing page is organized into clean, reusable components:
- `Header`: App logo and feature badges
- `HeroSection`: Main call-to-action with wallet connection
- `FeaturesSection`: Three main feature cards
- `ActivityTypes`: Grid of journalable activities
- `CTASection`: Final call-to-action
- `AnimatedBackground`: Floating background elements

### Dashboard
The main app interface after wallet connection, featuring:
- Journal entry creation
- Calendar view
- Entry list
- Theme switching

## Customization

The app uses a blue gradient theme that can be easily customized in:
- `app/globals.css`: CSS variables for colors
- Component files: Tailwind classes for styling

## License

MIT License - feel free to use this project as a starting point for your own Web3 applications!

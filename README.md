# Spond - Group & Event Management Platform

A modern, responsive group management and event coordination platform with a free notification stack.

## Features

- **Group Management**: Create and manage groups with subteams, roles, and member management
- **Event Coordination**: Schedule events, track RSVPs, send reminders
- **Free Notifications**: Email magic links, web push, and SMS via carrier email gateways
- **Mobile-First PWA**: Native-like experience on any device
- **Beautiful UI**: Modern design with smooth animations

## Tech Stack

- **Framework**: Next.js 15+ with App Router
- **Architecture**: MVVM (Model-View-ViewModel)
- **Authentication**: Clerk (Email, Phone, Google SSO)
- **Database**: Supabase (PostgreSQL with RLS)
- **Styling**: Tailwind CSS + shadcn/ui
- **Animations**: Framer Motion
- **Email**: Resend
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm
- Supabase account
- Clerk account
- Resend account (for email)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd spond-platform
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Configure your `.env.local` with your API keys:
```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx
CLERK_SECRET_KEY=sk_test_xxx

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx

# Web Push (generate with: npx web-push generate-vapid-keys)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=xxx
VAPID_PRIVATE_KEY=xxx

# Resend
RESEND_API_KEY=re_xxx

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

5. Set up the database:
   - Go to your Supabase dashboard
   - Open the SQL Editor
   - Copy the contents of `supabase/schema.sql` and run it

6. Start the development server:
```bash
npm run dev
```

7. Open [http://localhost:3000](http://localhost:3000)

### Generate VAPID Keys

For web push notifications, generate VAPID keys:

```bash
npx web-push generate-vapid-keys
```

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Authentication pages
│   ├── (dashboard)/       # Protected dashboard pages
│   ├── api/               # API routes
│   └── rsvp/              # Public RSVP pages
├── components/            # React components
│   ├── announcements/     # Announcement components
│   ├── groups/            # Group components
│   ├── layout/            # Layout components
│   ├── onboarding/        # Onboarding flow
│   ├── pwa/               # PWA components
│   └── ui/                # shadcn/ui components
├── hooks/                 # Custom React hooks
├── lib/                   # Utility functions
│   └── supabase/          # Supabase client
├── models/                # TypeScript types & DB models
└── viewmodels/            # MVVM ViewModels (hooks)
```

## Notification System

### Email Notifications
- Event invitations with magic link RSVPs
- Announcements and reminders
- Powered by Resend

### Web Push Notifications
- Instant notifications on supported browsers
- iOS support via PWA installation
- Service worker with offline support

### SMS via Email Gateway
Users provide their phone number and carrier during onboarding. The system sends SMS by emailing carrier-specific gateways:
- Verizon: `number@vtext.com`
- AT&T: `number@txt.att.net`
- T-Mobile: `number@tmomail.net`
- Bell: `number@txt.bell.ca`
- Rogers: `number@pcs.rogers.com`
- And more...

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the project in Vercel
3. Add environment variables
4. Deploy!

The `vercel.json` is already configured with proper headers for the service worker.

## Development

### Running Tests

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e
```

### Building for Production

```bash
npm run build
npm run start
```

## License

MIT

## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.




# Smile Alteration and Fashions - PWA

A modern Progressive Web App (PWA) for a professional tailoring business, built with Next.js 14, Supabase, and Tailwind CSS.

## 🌟 Features

### Customer Features (NO REGISTRATION NEEDED!)
- **Easy Order Placement**: Simple form - just fill and submit!
- **No Login Required**: Customers don't need to create accounts
- **Image Upload**: Upload reference photos for orders
- **WhatsApp Communication**: All updates via WhatsApp
- **PWA Support**: Install the app on home screen for app-like experience

### Admin Features
- **Phone OTP Login**: Secure admin-only access
- **Order Management Dashboard**: View and manage all orders in one place
- **Order Status Updates**: Update order status through workflow
- **Pricing Management**: Set and update final prices for orders
- **WhatsApp Integration**: One-click notify customers via WhatsApp ⭐
- **Admin Notes**: Internal notes for order management
- **Statistics Dashboard**: Quick overview of order counts by status

## 💡 How It Works (Simple!)

### Customer Flow:
1. Visit website → Click "Place Your Order"
2. Fill form (name, phone, service, details)
3. Submit → Done!
4. Admin contacts them via WhatsApp

### Admin Flow:
1. Login to admin dashboard
2. See all customer orders
3. Set price and update status
4. Click "Notify via WhatsApp" button
5. Continue conversation in WhatsApp!

**All communication happens via WhatsApp - simple and personal! 💬**

## 🛠️ Tech Stack

- **Framework**: Next.js 14 with App Router
- **Database & Auth**: Supabase (PostgreSQL + Auth)
- **Styling**: Tailwind CSS with custom design system
- **PWA**: next-pwa for Progressive Web App features
- **Deployment**: Vercel (recommended)
- **Language**: TypeScript

## 📋 Prerequisites

- Node.js 18+ and npm
- Supabase account (free tier available)
- Vercel account for deployment (optional)

## 🚀 Quick Start

### 1. Clone and Install

\`\`\`bash
# Install dependencies
npm install
\`\`\`

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run the schema from `supabase-schema.sql`
3. Go to Project Settings → API to get your keys
4. Enable Phone Auth in Authentication → Providers
5. Configure SMS provider (Twilio recommended for Malaysia)

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory:

\`\`\`env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Admin phone numbers (comma-separated, with country code)
NEXT_PUBLIC_ADMIN_PHONES=+60123456789
ADMIN_PHONE_NUMBERS=+60123456789
\`\`\`

### 4. Configure Supabase Storage

1. Go to Storage in Supabase dashboard
2. Create a new bucket called `order-images`
3. Set it to **Public** bucket
4. Update CORS if needed

### 5. Generate PWA Icons

Create two icon files in the `public` folder:
- `icon-192x192.png` (192x192 pixels)
- `icon-512x512.png` (512x512 pixels)

Or use a tool like [PWA Asset Generator](https://www.pwabuilder.com/imageGenerator):

\`\`\`bash
npx pwa-asset-generator public/logo.png public/
\`\`\`

### 6. Run Development Server

\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📱 Testing the PWA

### On Desktop
1. Open the app in Chrome/Edge
2. Click the install icon in the address bar
3. The app will install as a desktop app

### On Mobile
1. Open the app in Chrome (Android) or Safari (iOS)
2. Tap "Add to Home Screen"
3. The app will appear on your home screen

## 🔐 Setting Up Admin Access

Admin access is controlled by phone numbers in environment variables:

1. Add admin phone numbers to `.env.local`:
   \`\`\`
   NEXT_PUBLIC_ADMIN_PHONES=+60123456789,+60198765432
   ADMIN_PHONE_NUMBERS=+60123456789,+60198765432
   \`\`\`

2. Use the same format with country code (+60 for Malaysia)

3. When these users log in, they'll be redirected to `/admin/dashboard`

## 📦 Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub

2. Import to Vercel:
   \`\`\`bash
   # Or use Vercel CLI
   npm i -g vercel
   vercel
   \`\`\`

3. Add environment variables in Vercel dashboard

4. Deploy!

### Important: Update next.config.mjs

After deploying, update the Supabase domain in `next.config.mjs`:

\`\`\`javascript
images: {
  domains: ['your-project-id.supabase.co'],
},
\`\`\`

## 🎨 Design System

The app follows a comprehensive design system with:

- **Colors**: Primary (#0A84FF), Success (#30D158), Warning (#FFD60A), Error (#FF453A)
- **Typography**: Inter font family with modular scale
- **Spacing**: 8-point grid system (4px, 8px, 16px, 24px, 32px, etc.)
- **Components**: Fully accessible, consistent UI components

See `src/components/ui/` for reusable components.

## 🔧 Configuration

### SMS Provider Setup (Supabase)

For Malaysia, Twilio is recommended:

1. Create a Twilio account
2. Get a phone number with SMS capability
3. Add Twilio credentials to Supabase:
   - Project Settings → Auth → SMS Provider
   - Select Twilio
   - Add Account SID and Auth Token
4. Test with your phone number

### WhatsApp Integration

The WhatsApp notification feature uses the `wa.me` API:
- No additional setup required
- Works on all platforms
- Opens WhatsApp with pre-filled message

## 📱 PWA Features

- ✅ Offline support
- ✅ Install to home screen
- ✅ App-like experience
- ✅ Fast loading with service workers
- ✅ Push notifications ready (Phase 2)

## 🗂️ Project Structure

\`\`\`
smile-alteration-fashions/
├── src/
│   ├── app/                   # Next.js 14 App Router
│   │   ├── api/              # API routes
│   │   ├── admin/            # Admin pages
│   │   ├── account/          # Customer account page
│   │   ├── login/            # Login page
│   │   ├── order/            # Order pages
│   │   └── page.tsx          # Homepage
│   ├── components/
│   │   └── ui/               # Reusable UI components
│   ├── lib/
│   │   └── supabase/         # Supabase clients
│   └── types/                # TypeScript types
├── public/                    # Static files
│   ├── manifest.json         # PWA manifest
│   └── icon-*.png           # PWA icons
├── supabase-schema.sql       # Database schema
└── package.json
\`\`\`

## 🧪 Testing Checklist

- [ ] User can place an order (guest)
- [ ] User can sign up with phone OTP
- [ ] User can view their orders
- [ ] Admin can view all orders
- [ ] Admin can update order status
- [ ] Admin can set price
- [ ] WhatsApp notification works
- [ ] PWA installs on mobile
- [ ] PWA installs on desktop
- [ ] Image upload works
- [ ] Offline mode works

## 🔄 Phase 2 Features (Future)

- [ ] Push notifications for order updates
- [ ] Appointment booking system
- [ ] Online payment integration (Stripe/Senangpay)
- [ ] Customer profile management
- [ ] Review and rating system
- [ ] Email notifications

## 📞 Support

For issues or questions:
- Check the [Supabase Docs](https://supabase.com/docs)
- Check the [Next.js Docs](https://nextjs.org/docs)
- Review the provided documentation files

## 📄 License

Private - All Rights Reserved

---

**Built with ❤️ for Smile Alteration and Fashions**


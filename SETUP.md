# Complete Setup Guide for Smile Alteration and Fashions PWA

This guide will walk you through the complete setup process from scratch.

## Step 1: Install Node.js and Dependencies

1. **Install Node.js** (if not already installed):
   - Download from [nodejs.org](https://nodejs.org/) (LTS version)
   - Verify installation: `node --version` (should be 18 or higher)

2. **Navigate to project directory and install dependencies**:
   \`\`\`bash
   cd smile-alteration-fashions
   npm install
   \`\`\`

## Step 2: Set Up Supabase Backend

### 2.1 Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign in or create an account
3. Click "New Project"
4. Fill in:
   - **Name**: Smile Alteration Fashions
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Southeast Asia (Singapore) - closest to Malaysia
5. Wait for the project to be created (~2 minutes)

### 2.2 Set Up Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy the entire contents of `supabase-schema.sql` file
4. Paste it into the SQL editor
5. Click **Run** (bottom right)
6. You should see "Success. No rows returned"

### 2.3 Configure Phone Authentication

1. Go to **Authentication** → **Providers**
2. Scroll to **Phone**
3. Enable the toggle
4. For testing, you can use Supabase's built-in test OTP
5. For production, configure Twilio:

#### Twilio Setup (Production):

1. Create account at [twilio.com](https://www.twilio.com/try-twilio)
2. Get a phone number with SMS capability
3. Find your credentials in Twilio Console:
   - Account SID
   - Auth Token
4. In Supabase Phone settings:
   - Select **Twilio** as provider
   - Enter Account SID and Auth Token
   - Twilio Message Service SID (optional)
   - Click **Save**

### 2.4 Configure Storage

1. Go to **Storage** in Supabase dashboard
2. Click **New Bucket**
3. Name it: `order-images`
4. Set **Public bucket**: ON (toggle)
5. Click **Create bucket**

### 2.5 Get API Keys

1. Go to **Project Settings** (gear icon)
2. Click **API**
3. Copy these values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: Long string starting with `eyJ...`
4. Keep these for the next step

## Step 3: Configure Environment Variables

1. Create a file named `.env.local` in the project root:

\`\`\`env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Admin Configuration (Replace with your actual phone number)
NEXT_PUBLIC_ADMIN_PHONES=+60123456789
ADMIN_PHONE_NUMBERS=+60123456789
\`\`\`

2. Replace:
   - `NEXT_PUBLIC_SUPABASE_URL` with your Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` with your anon key
   - Phone numbers with your actual admin phone (with +60 country code)

3. For multiple admins, use comma-separated values:
   \`\`\`
   NEXT_PUBLIC_ADMIN_PHONES=+60123456789,+60198765432
   \`\`\`

## Step 4: Create PWA Icons

You need two icon sizes for the PWA:

### Option A: Use an existing logo

1. Place your logo file (PNG, at least 512x512px) in the `public` folder
2. Install PWA Asset Generator:
   \`\`\`bash
   npm install -g pwa-asset-generator
   \`\`\`
3. Generate icons:
   \`\`\`bash
   pwa-asset-generator public/your-logo.png public/ --icon-only
   \`\`\`

### Option B: Create manually

Create two PNG files in the `public` folder:
- `icon-192x192.png` (192 x 192 pixels)
- `icon-512x512.png` (512 x 512 pixels)

Use your business logo or create a simple icon with:
- Background: Your brand color
- Text: "SA" (Smile Alteration) or scissors icon

Tools to create icons:
- [Canva](https://canva.com) (free)
- [Figma](https://figma.com) (free)
- Photoshop/Illustrator

## Step 5: Update Configuration Files

1. Open `next.config.mjs`
2. Update the Supabase domain in the images section:
   \`\`\`javascript
   images: {
     domains: ['xxxxx.supabase.co'], // Replace xxxxx with your project ID
   },
   \`\`\`

## Step 6: Test Locally

1. Start the development server:
   \`\`\`bash
   npm run dev
   \`\`\`

2. Open [http://localhost:3000](http://localhost:3000)

3. Test the following:
   - Homepage loads ✓
   - Click "Place Your Order" → Order form appears ✓
   - Fill form and submit ✓
   - Click "Login" → Phone login appears ✓
   - Enter your phone number and verify OTP ✓

## Step 7: Deploy to Vercel

### 7.1 Prepare for Deployment

1. Initialize git (if not already):
   \`\`\`bash
   git init
   git add .
   git commit -m "Initial commit"
   \`\`\`

2. Create a GitHub repository
3. Push to GitHub:
   \`\`\`bash
   git remote add origin https://github.com/yourusername/smile-alteration.git
   git push -u origin main
   \`\`\`

### 7.2 Deploy with Vercel

1. Go to [vercel.com](https://vercel.com)
2. Sign up/login with GitHub
3. Click **Add New** → **Project**
4. Import your GitHub repository
5. Configure:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - Click **Environment Variables**
   - Add all variables from `.env.local`:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `NEXT_PUBLIC_ADMIN_PHONES`
     - `ADMIN_PHONE_NUMBERS`
6. Click **Deploy**
7. Wait 2-3 minutes for deployment
8. Your app will be live at `https://your-app.vercel.app`

### 7.3 Configure Custom Domain (Optional)

1. In Vercel project settings → **Domains**
2. Add your custom domain
3. Update DNS records as instructed
4. SSL certificate will be automatically generated

## Step 8: Test PWA Installation

### On Android (Chrome):

1. Open your deployed URL on mobile
2. Chrome will show "Add to Home screen" banner
3. Tap "Add"
4. App icon appears on home screen
5. Open it - should feel like a native app

### On iOS (Safari):

1. Open your deployed URL on iPhone
2. Tap the Share button (square with arrow)
3. Scroll and tap "Add to Home Screen"
4. Tap "Add"
5. App icon appears on home screen

### On Desktop (Chrome/Edge):

1. Open your deployed URL
2. Look for install icon in address bar (computer with arrow)
3. Click it
4. Click "Install"
5. App opens in its own window

## Step 9: Production Checklist

Before going live:

- [ ] Test order placement (guest user)
- [ ] Test OTP login
- [ ] Test order viewing (customer)
- [ ] Test admin login
- [ ] Test order management (admin)
- [ ] Test WhatsApp notification
- [ ] Test PWA install on Android
- [ ] Test PWA install on iOS
- [ ] Test PWA install on desktop
- [ ] Test image upload
- [ ] Verify all environment variables in Vercel
- [ ] Check that admin phone numbers are correct
- [ ] Test on multiple devices

## Troubleshooting

### Issue: OTP not sending

**Solution**: 
- Check Twilio configuration in Supabase
- Verify phone number format (+60123456789)
- Check Twilio balance and phone number status
- For testing, use Supabase test OTP (check email)

### Issue: Images not uploading

**Solution**:
- Check Storage bucket is public
- Verify bucket name is `order-images`
- Check browser console for errors
- Verify Supabase URL in environment variables

### Issue: Admin can't access dashboard

**Solution**:
- Verify phone number in `.env.local` matches exactly
- Must include country code (+60 for Malaysia)
- Check no extra spaces in environment variable
- Restart dev server after changing .env.local

### Issue: PWA not installing

**Solution**:
- Verify icons exist in `/public` folder
- Check `manifest.json` is correct
- Must be served over HTTPS (Vercel provides this)
- Try clearing browser cache and reload

### Issue: Build fails on Vercel

**Solution**:
- Check all environment variables are set in Vercel
- Verify no TypeScript errors locally: `npm run lint`
- Check build command in Vercel is `npm run build`
- Review build logs for specific error

## Getting Help

- **Supabase Issues**: [supabase.com/docs](https://supabase.com/docs)
- **Next.js Issues**: [nextjs.org/docs](https://nextjs.org/docs)
- **Vercel Issues**: [vercel.com/docs](https://vercel.com/docs)
- **Twilio Issues**: [twilio.com/docs](https://www.twilio.com/docs)

## Next Steps (Phase 2)

Once the basic app is working:
1. Set up push notifications
2. Add appointment booking
3. Integrate payment gateway
4. Add analytics

---

**Congratulations! Your PWA is now live! 🎉**


# Deployment Checklist for Smile Alteration and Fashions PWA

## Pre-Deployment Checklist

### ✅ Supabase Configuration
- [ ] Created Supabase project
- [ ] Executed `supabase-schema.sql` in SQL Editor
- [ ] Verified all tables created (users, services, orders, appointments)
- [ ] Default services inserted
- [ ] Created `order-images` storage bucket (set to PUBLIC)
- [ ] Configured Phone Auth provider
- [ ] Set up Twilio for SMS (production) or using test OTP (development)
- [ ] Obtained Project URL and anon key

### ✅ Environment Variables
- [ ] Created `.env.local` file
- [ ] Added `NEXT_PUBLIC_SUPABASE_URL`
- [ ] Added `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] Added `NEXT_PUBLIC_ADMIN_PHONES` (with +60 country code)
- [ ] Added `ADMIN_PHONE_NUMBERS` (same as above)

### ✅ PWA Assets
- [ ] Created `icon-192x192.png` in public folder
- [ ] Created `icon-512x512.png` in public folder
- [ ] Verified `manifest.json` exists and is configured
- [ ] (Optional) Created `favicon.ico`

### ✅ Code Configuration
- [ ] Updated `next.config.mjs` with correct Supabase domain in images
- [ ] Verified all imports are correct
- [ ] No TypeScript errors (`npm run lint`)
- [ ] Tested locally (`npm run dev`)

### ✅ Local Testing
- [ ] Homepage loads correctly
- [ ] "Place Your Order" button works
- [ ] Order form submission works (guest)
- [ ] Login with phone OTP works
- [ ] Customer can view their orders
- [ ] Admin login redirects to dashboard
- [ ] Admin can view all orders
- [ ] Admin can update order status
- [ ] Admin can set prices
- [ ] WhatsApp notification button appears for "ready" status
- [ ] Image upload works

## Deployment Steps

### 1. Prepare Repository

\`\`\`bash
# Initialize git (if not done)
git init
git add .
git commit -m "Initial deployment"

# Create GitHub repository and push
git remote add origin https://github.com/yourusername/smile-alteration.git
git branch -M main
git push -u origin main
\`\`\`

### 2. Deploy to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click **Add New** → **Project**
3. Import your GitHub repository
4. Configure project:
   - Framework Preset: **Next.js** (auto-detected)
   - Root Directory: `./`
   - Build Command: `npm run build` (default)
   - Output Directory: `.next` (default)

5. **Add Environment Variables**:
   \`\`\`
   NEXT_PUBLIC_SUPABASE_URL = your-project-url.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY = your-anon-key
   NEXT_PUBLIC_ADMIN_PHONES = +60123456789
   ADMIN_PHONE_NUMBERS = +60123456789
   \`\`\`

6. Click **Deploy**
7. Wait for deployment (2-3 minutes)
8. Your app is live at `https://your-project.vercel.app`

### 3. Post-Deployment Configuration

#### A. Update Supabase Auth Settings

1. Go to Supabase Dashboard → **Authentication** → **URL Configuration**
2. Add your Vercel URL to **Site URL**:
   \`\`\`
   https://your-project.vercel.app
   \`\`\```
3. Add to **Redirect URLs**:
   \`\`\`
   https://your-project.vercel.app/**
   \`\`\`

#### B. Configure Custom Domain (Optional)

1. In Vercel: Project Settings → **Domains**
2. Add your domain (e.g., `smile-tailor.com`)
3. Update DNS records:
   - **Type**: A
   - **Name**: @ (or subdomain)
   - **Value**: Vercel IP (provided)
4. Or use CNAME:
   - **Type**: CNAME
   - **Name**: @ (or subdomain)
   - **Value**: `cname.vercel-dns.com`
5. Wait for DNS propagation (5-60 minutes)
6. Update Supabase Auth URLs with custom domain

## Post-Deployment Testing

### Test on Multiple Devices

#### Desktop Testing (Chrome/Edge)
- [ ] Open production URL
- [ ] Homepage renders correctly
- [ ] Navigation works
- [ ] Order placement works
- [ ] Login works
- [ ] Admin dashboard accessible
- [ ] Install PWA (click install icon in address bar)
- [ ] PWA opens in standalone window
- [ ] All features work in installed PWA

#### Mobile Testing (Android - Chrome)
- [ ] Open production URL on mobile browser
- [ ] Homepage is responsive
- [ ] "Add to Home Screen" prompt appears
- [ ] Install PWA
- [ ] App icon appears on home screen
- [ ] Open installed PWA
- [ ] Feels like native app (no browser UI)
- [ ] Order placement works
- [ ] Image upload works (camera + gallery)
- [ ] WhatsApp link opens WhatsApp app

#### Mobile Testing (iOS - Safari)
- [ ] Open production URL in Safari
- [ ] Tap Share → Add to Home Screen
- [ ] Install PWA
- [ ] App icon appears on home screen
- [ ] Open installed PWA
- [ ] All features work
- [ ] Phone OTP works

### Functionality Testing

#### Customer Flow
- [ ] Guest can place order without login
- [ ] Guest order shows confirmation
- [ ] User can login with phone OTP
- [ ] OTP arrives within 30 seconds
- [ ] Login redirects to account page
- [ ] User can view their orders
- [ ] Order statuses display correctly
- [ ] User can place new order when logged in
- [ ] Image upload works
- [ ] Images display in orders

#### Admin Flow
- [ ] Admin login redirects to dashboard
- [ ] Dashboard shows order statistics
- [ ] Can filter orders by status
- [ ] Can click order to see details
- [ ] Can update order status
- [ ] Can set final price
- [ ] Can add admin notes
- [ ] WhatsApp button shows for "ready" orders
- [ ] WhatsApp opens with correct message
- [ ] Changes save successfully
- [ ] Customer sees updated status

### Performance Testing
- [ ] Homepage loads in < 3 seconds
- [ ] Order form is responsive
- [ ] Images load quickly
- [ ] No console errors
- [ ] PWA works offline (cached pages)
- [ ] Service worker registered
- [ ] Lighthouse PWA score > 90

### Security Testing
- [ ] Non-admin can't access admin routes
- [ ] Users can only see their own orders
- [ ] API routes check authentication
- [ ] Environment variables not exposed in client
- [ ] HTTPS enabled (automatic with Vercel)
- [ ] Supabase RLS policies working

## Monitoring and Maintenance

### Set Up Monitoring

#### Vercel Analytics
1. Enable Vercel Analytics in project settings
2. View real-time performance metrics
3. Monitor page load times

#### Supabase Metrics
1. Check Database tab for query performance
2. Monitor Auth tab for login success rates
3. Check Storage for upload statistics

### Regular Maintenance Tasks

#### Weekly
- [ ] Check order volume in admin dashboard
- [ ] Review any failed orders
- [ ] Monitor Twilio SMS balance
- [ ] Check for any error logs in Vercel

#### Monthly
- [ ] Review Supabase usage (database size, API calls)
- [ ] Check Vercel bandwidth usage
- [ ] Update dependencies if needed: `npm outdated`
- [ ] Review and respond to customer feedback

#### As Needed
- [ ] Add new services in Supabase
- [ ] Update pricing
- [ ] Add new admin users
- [ ] Backup database (Supabase auto-backups available)

## Troubleshooting Common Issues

### Issue: OTP Not Received
**Diagnosis:**
- Check Twilio account balance
- Verify phone number format (+60 format)
- Check Supabase Auth logs

**Solution:**
- Ensure Twilio is configured correctly
- Verify phone provider doesn't block OTPs
- Use test OTP for development

### Issue: Images Not Displaying
**Diagnosis:**
- Check browser console for CORS errors
- Verify Storage bucket is public
- Check image URLs in database

**Solution:**
- Make `order-images` bucket public
- Update `next.config.mjs` with correct domain
- Redeploy on Vercel

### Issue: Admin Can't Access Dashboard
**Diagnosis:**
- Check environment variables in Vercel
- Verify phone number format
- Check browser console for errors

**Solution:**
- Update `NEXT_PUBLIC_ADMIN_PHONES` in Vercel
- Use exact format: `+60123456789`
- Redeploy after changing env variables

### Issue: PWA Not Installing
**Diagnosis:**
- Check manifest.json is accessible
- Verify icons exist at correct paths
- Must be served over HTTPS

**Solution:**
- Ensure icons in `/public` folder
- Clear browser cache
- Verify manifest.json syntax
- Check Lighthouse PWA report

## Scaling Considerations

### When to Upgrade

#### Supabase Free Tier Limits:
- **Database**: 500 MB (sufficient for ~10,000 orders)
- **Storage**: 1 GB (sufficient for ~1,000 images)
- **API Requests**: Unlimited on free tier

**Upgrade when:**
- Database size exceeds 400 MB
- Storage size exceeds 800 MB
- Need more than 2 concurrent connections

#### Vercel Free Tier Limits:
- **Bandwidth**: 100 GB/month
- **Build Minutes**: 6,000 minutes/month
- **Serverless Function Execution**: 100 GB-hours

**Upgrade when:**
- Traffic exceeds 50,000 visitors/month
- Need team collaboration features

### Phase 2 Features

When ready to add:
1. **Push Notifications**: Use Web Push API + Supabase Realtime
2. **Appointments**: Already have database schema, create UI
3. **Payments**: Integrate Stripe or Senangpay
4. **Analytics**: Add Google Analytics or Mixpanel
5. **Reviews**: Add rating system to completed orders

## Emergency Rollback Procedure

If deployment has critical issues:

1. **Revert in Vercel:**
   - Go to project Deployments
   - Click on previous working deployment
   - Click **Promote to Production**

2. **Revert Database Schema:**
   - Have backup of schema ready
   - Run rollback SQL if needed
   - Supabase provides point-in-time recovery (paid plans)

3. **Communication:**
   - Update customers via WhatsApp/social media
   - Put maintenance notice on website
   - Fix issue in development before redeploying

## Success Metrics

Track these KPIs after launch:

- **Order Conversion**: % of visitors who place orders
- **PWA Install Rate**: % of visitors who install PWA
- **Admin Response Time**: Time to respond to orders
- **Customer Satisfaction**: Track via reviews/feedback
- **System Uptime**: Should be > 99.9% (Vercel + Supabase)

## Conclusion

✅ **Your PWA is now deployed and ready for customers!**

Next steps:
1. Test thoroughly with the checklist above
2. Share the URL with a small group of beta users
3. Gather feedback and iterate
4. Officially launch on social media
5. Monitor metrics and optimize

🎉 **Congratulations on launching your PWA!**


# 🎯 Complete Workflow - Option A (Database + WhatsApp)

## 📱 **Customer Flow**

### Step 1: Customer Opens App
- Visits the homepage
- Sees the Smile Alteration logo
- Two main options:
  - **Order Custom Clothes** (Baju Kurung, Baju Melayu, etc.)
  - **Alteration** (Hemming, Tapering, Repairs, etc.)

### Step 2: Customer Fills Order Form
Customer clicks a service button → Modal opens with form:

**Required Fields:**
- ✅ Name
- ✅ Phone Number
- ✅ Service Selection (from dropdown grid)

**Optional Fields:**
- 📝 Details & Requirements
- 📸 Reference Images (up to 5)
  - Gallery button (choose from phone)
  - Camera button (take photo)

### Step 3: Customer Submits Order
When customer clicks "Send to WhatsApp":

1. **✅ Order Saved to Database**
   - Status: `pending`
   - All details stored
   - Images uploaded to Supabase Storage
   - Order gets unique ID

2. **📱 WhatsApp Opens Automatically**
   - Pre-filled message with all order details
   - Includes Order #ID
   - Links to uploaded images
   - Sends to: `0132068891`

3. **✅ Success Message**
   - "Order saved successfully!"
   - WhatsApp opens for customer to send

---

## 👨‍💼 **Admin Flow**

### Step 1: Admin Logs In
- Navigate to `/admin/login` or click "Admin Access"
- Login with:
  - **Email:** `admin@gmail.com`
  - **Password:** `admin123`

### Step 2: Admin Dashboard
Admin sees:

**📊 Statistics Cards:**
- Total Orders
- Pending Orders
- In Progress Orders
- Ready Orders

**🔍 Filter Tabs:**
- All Orders
- Pending
- In Progress
- Ready

**📋 Order List:**
Each order card shows:
- Order #ID
- Order Type badge (Custom / Alteration)
- Service name
- Customer name & phone
- Order details preview
- Image thumbnails (first 3)
- Status badge (color-coded)
- Price (if set)
- Date & time

### Step 3: View Order Details
Admin clicks on an order → Order details page shows:

**Customer Information:**
- Name
- Phone number
- Service type
- Full details & requirements
- Order date

**Reference Images:**
- Grid of all uploaded images
- Click to view full size
- Opens in new tab

**Update Order Section:**
- Status Dropdown:
  - Pending
  - In Progress
  - Ready for Pickup
  - Completed
- Price Input (RM)
- "Update Order" button

**Notify Customer Button:**
- Green WhatsApp button
- Opens WhatsApp with pre-filled update message
- Includes order #, status, price
- Customer phone auto-filled

---

## 🔄 **Complete Workflow Example**

### Example: Customer Orders Custom Baju Kurung

**1. Customer Side:**
```
Customer opens app
↓
Clicks "Order Custom Clothes"
↓
Selects "Baju Kurung" from service grid
↓
Fills form:
  - Name: "Siti Ahmad"
  - Phone: "0123456789"
  - Details: "Red color, size M, need by Friday"
  - Uploads 2 reference images
↓
Clicks "Send to WhatsApp"
↓
Order #45 saved to database (status: pending)
↓
WhatsApp opens with message:
  "*CUSTOM CLOTHES ORDER*
   *Order #45*
   
   👤 Name: Siti Ahmad
   📱 Phone: +60123456789
   👔 Service: Baju Kurung
   
   📝 Details:
   Red color, size M, need by Friday
   
   📷 Images:
   [image URL 1]
   [image URL 2]
   
   _Order saved - View in Admin Dashboard_"
↓
Customer sends WhatsApp message
```

**2. Admin Side:**
```
Admin receives WhatsApp notification
↓
Admin logs into dashboard
↓
Sees Order #45 in "Pending" tab:
  ┌────────────────────────────────┐
  │ Order #45        [Custom]      │
  │ Baju Kurung    🟡 pending      │
  │                                │
  │ Siti Ahmad                     │
  │ +60123456789                   │
  │                                │
  │ Red color, size M, need by...  │
  │                                │
  │ [img] [img] ...                │
  │                                │
  │ 20 Oct 2025, 2:30 PM           │
  └────────────────────────────────┘
↓
Admin clicks Order #45
↓
Views full details and images
↓
Admin updates:
  - Status: "In Progress"
  - Price: RM 250.00
↓
Clicks "Update Order"
↓
Admin clicks "Notify Customer via WhatsApp"
↓
WhatsApp opens with:
  "Hello Siti Ahmad! 👋
   
   *Order Update - Order #45*
   
   Custom Clothes - Baju Kurung
   Status: *IN PROGRESS*
   
   💰 Price: *RM 250.00*
   
   👔 We're working on your order.
   We'll notify you when it's ready!
   
   _Smile Alteration & Fashions_"
↓
Admin sends WhatsApp message
↓
Customer receives update
```

**3. When Order is Ready:**
```
Admin updates Order #45:
  - Status: "Ready"
↓
Clicks "Notify Customer via WhatsApp"
↓
WhatsApp message:
  "Hello Siti Ahmad! 👋
   
   *Order Update - Order #45*
   
   Custom Clothes - Baju Kurung
   Status: *READY*
   
   💰 Price: *RM 250.00*
   
   ✅ Your order is ready for pickup!
   Please visit us at your convenience.
   
   _Smile Alteration & Fashions_"
↓
Customer picks up order
↓
Admin marks as "Completed"
```

---

## 📊 **Database Structure**

### Orders Table Columns:
- `id` - Auto-incrementing order number
- `name` - Customer name
- `phone` - Customer phone (formatted with +60)
- `service` - Service name (e.g., "Baju Kurung")
- `details` - Customer requirements (optional)
- `image_urls` - Array of image URLs from Supabase Storage
- `order_type` - "custom" or "alteration"
- `status` - "pending", "in_progress", "ready", "completed"
- `final_price` - Price set by admin (nullable)
- `created_at` - Order creation timestamp
- `updated_at` - Last update timestamp

---

## 🚀 **Setup Instructions**

### 1. Run Database Migration
Go to your Supabase SQL Editor and run:
```bash
supabase-migration-update-orders.sql
```

This will:
- Add new columns to orders table
- Create proper indexes
- Update RLS policies for admin access

### 2. Create Storage Bucket
In Supabase:
1. Go to Storage
2. Create bucket: `order-images`
3. Make it **public**
4. Enable RLS (allow public uploads)

### 3. Test the Flow
**Customer Test:**
1. Open app homepage
2. Click "Order Custom Clothes"
3. Fill form and upload image
4. Submit order
5. Check WhatsApp opens with details

**Admin Test:**
1. Go to `/admin/login`
2. Login with `admin@gmail.com` / `admin123`
3. See order in dashboard
4. Click order to view details
5. Update status and price
6. Click "Notify Customer"
7. Check WhatsApp opens with update

---

## ✅ **Benefits of This Workflow**

### For Customers:
✅ No registration needed
✅ Simple 3-step process
✅ Instant WhatsApp confirmation
✅ Can track order #ID
✅ Receives WhatsApp updates

### For Admin:
✅ All orders in one dashboard
✅ Easy status tracking
✅ Set prices per order
✅ One-click WhatsApp notifications
✅ View all customer images
✅ Complete order history
✅ Filter by status

### For Business:
✅ Professional workflow
✅ Customer communication via WhatsApp
✅ Order tracking and history
✅ Data backup in database
✅ Scalable system
✅ Mobile-friendly admin panel

---

## 🎯 **Next Steps**

Once you've tested the workflow:

1. **Customize WhatsApp messages** - Edit notification texts in:
   - `src/app/page.tsx` (customer submission)
   - `src/app/admin/orders/[id]/page.tsx` (admin notifications)

2. **Add more services** - Update the service arrays in:
   - `CUSTOM_SERVICES` array
   - `ALTERATION_SERVICES` array

3. **Customize admin login** - Change credentials in:
   - `src/app/admin/login/page.tsx`

4. **Deploy to production** - Use Vercel for hosting

---

**Your app is now fully functional with database tracking and WhatsApp integration!** 🎉


# User Access Control System

## Overview

The system now has controlled user access with different permission levels:

- **Guests**: Rate-limited access (10 requests/hour)
- **Unapproved Users**: Very limited access (5 requests/hour)
- **Approved Users**: Unlimited access
- **Admins**: Unlimited access + user management

## How It Works

### 1. User Registration
- Users can register but must be manually approved
- Registration sends approval request email to admin
- New users are unapproved by default

### 2. Rate Limiting
Applied to these API endpoints:
- `/api/chat/*` - Chat functionality
- `/api/document/*` - Document management
- `/api/files/upload/*` - File uploads

### 3. Admin Dashboard
Access at `/admin` (admin users only):
- View pending approval requests
- Approve/reject users
- Manage user roles
- Promote users to admin

## Setting Up Your Admin Account

### Method 1: Database Direct Update
```sql
-- Make yourself an admin
UPDATE "User"
SET role = 'admin', "isApproved" = true, "approvedAt" = NOW()
WHERE email = 'your-email@domain.com';
```

### Method 2: Environment Flag (Optional)
You could add an environment variable to auto-approve the first admin:

```bash
ADMIN_EMAIL=your-email@domain.com
```

## Environment Variables Required

Add to `.env.local`:

```bash
# Email notifications
RESEND_API_KEY=re_your_api_key_here
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Your Redis URL is already configured
REDIS_URL=redis://...
```

## User Flow

1. **Guest Access**: Limited rate-limited access without account
2. **Registration**: User signs up → pending approval
3. **Admin Approval**: Admin receives email → approves via dashboard
4. **Full Access**: User receives approval email → unlimited access

## Rate Limits

- **Guests**: 10 requests/hour
- **Unapproved Users**: 5 requests/hour
- **Approved Users**: 1000 requests/hour (effectively unlimited)

Rate limits are enforced via Redis and apply per user/IP address.

## Admin Features

As an admin, you can:
- View all users and their approval status
- Approve pending users
- Reject/delete users
- Promote users to admin role
- Manage the entire user base

## Security Notes

- Only approved users get full system access
- Admin approval is required for all new accounts
- Rate limiting prevents abuse from guests/unapproved users
- All user management actions are logged
- Email notifications keep admins informed of new requests
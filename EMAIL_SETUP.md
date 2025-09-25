# Email Setup Guide

## Required Environment Variables

Add these environment variables to your `.env.local` file:

```bash
# Resend API Key (get from https://resend.com)
RESEND_API_KEY=re_your_api_key_here

# Your application URL for links in emails
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Resend Setup

1. Sign up at https://resend.com
2. Create a new API key
3. Add your domain or use the default sandbox domain for testing
4. Update the `from` email addresses in `lib/email.ts` to match your domain

## Email Configuration

Update these values in `lib/email.ts`:

- `from: "noreply@yourdomain.com"` - Replace with your domain
- `to: "admin@yourdomain.com"` - Replace with admin email for approval requests

## Email Templates

The system sends two types of emails:

1. **Approval Request** - Sent to admin when a new user registers
2. **Approval Notification** - Sent to user when approved/rejected

## Testing

For testing, you can use Resend's sandbox domain which allows sending to any email address without domain verification.

## Production Setup

For production:
1. Verify your domain in Resend
2. Update all email addresses to use your verified domain
3. Set up proper DNS records for email deliverability
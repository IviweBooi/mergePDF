# EmailJS Setup Guide

This guide will help you set up EmailJS to send emails through your contact form.

## Step 1: Create EmailJS Account

1. Go to [EmailJS.com](https://www.emailjs.com/)
2. Sign up for a free account
3. Verify your email address

## Step 2: Create Email Service

1. In your EmailJS dashboard, go to "Email Services"
2. Click "Add New Service"
3. Choose your email provider (Gmail, Outlook, etc.)
4. Follow the authentication steps
5. Note down your **Service ID** (e.g., `service_abc123`)

## Step 3: Create Email Template

1. Go to "Email Templates"
2. Click "Create New Template"
3. Design your email template with these variables:
   - `{{name}}` - Sender's name
   - `{{email}}` - Sender's email
   - `{{subject}}` - Email subject
   - `{{message}}` - Email message
   - `{{newsletter}}` - Newsletter subscription preference

### Example Template:
```
Subject: New Contact Form Submission - {{subject}}

Name: {{name}}
Email: {{email}}
Subject: {{subject}}
Newsletter: {{newsletter}}

Message:
{{message}}
```

4. Save the template and note down your **Template ID** (e.g., `template_xyz789`)

## Step 4: Get Your Public Key

1. Go to "Account" → "API Keys"
2. Copy your **Public Key** (e.g., `user_abc123`)

## Step 5: Update Configuration

1. Open `config.js` in your project
2. Replace the placeholder values with your actual credentials:

```javascript
window.EMAILJS_CONFIG = {
    PUBLIC_KEY: 'your_public_key_here',
    SERVICE_ID: 'your_service_id_here',
    TEMPLATE_ID: 'your_template_id_here'
};
```

## Step 6: Test the Integration

1. Open your contact form page
2. Fill out the form with test data
3. Submit the form
4. Check your email to confirm the message was received

## Security Notes

- The public key is safe to expose in client-side code
- Service ID and Template ID are also safe for client-side use
- EmailJS handles the server-side email sending securely

## Troubleshooting

### Common Issues:

1. **"EmailJS is not defined"**
   - Make sure the EmailJS SDK is loaded before your script.js
   - Check that the CDN link is accessible

2. **"Service not found"**
   - Verify your Service ID is correct
   - Ensure your email service is properly connected

3. **"Template not found"**
   - Verify your Template ID is correct
   - Check that your template is published

4. **"Public key is invalid"**
   - Verify your Public Key is correct
   - Ensure your EmailJS account is active

## Free Tier Limits

- EmailJS free tier allows 200 emails per month
- Perfect for personal projects and small websites
- Upgrade for more emails if needed

## Support

- EmailJS Documentation: https://www.emailjs.com/docs/
- EmailJS Community: https://community.emailjs.com/

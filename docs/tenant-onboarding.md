# Minimal Tenant Onboarding

This is the smallest setup needed to onboard a restaurant tenant without forcing them onto a new WhatsApp number on day one.

## 1. Create The Tenant

Capture:

- Restaurant or group name
- Owner name
- Owner email
- Owner phone for internal alerts
- Timezone, default `Europe/London`

Backend target:

- `groups`
- `users`
- `memberships`

## 2. Add The First Site

Capture:

- Site name, for example `Islington`
- Street address
- City
- Postcode
- Optional Google place/location ID later

Backend target:

- `sites`

Rule:

- Every customer, review, enquiry, campaign, message, and booking should be either site-scoped or explicitly `All sites`.

## 3. Set WhatsApp Mode

Choose one mode:

| Mode | Use When | What We Store |
|---|---|---|
| `basic` | They already use WhatsApp Business and need a fast 30-day pilot | Display name, phone number, click-to-WhatsApp link, QR label |
| `connected` | They are ready for WhatsApp Cloud API automation | WABA ID, phone number ID, token reference, webhook routing |
| `managed` | You are helping them create/register the right number | Display name, intended phone, setup status |

Backend target:

- `whatsappAccounts`

Minimum fields:

- `groupId`
- optional `siteId`
- `mode`
- `status`
- `displayName`
- `displayPhoneNumber`
- `defaultFlow`
- `clickToWhatsAppUrl`

Important:

- Your own WhatsApp number is only for demos and your sales/support.
- Each tenant should use its own customer-facing number.
- A multi-site tenant can use one `All sites` number first, then add branch-specific numbers later.

## 4. Create The 30-Day Pilot Flow

Default flow:

1. Customer taps QR/link.
2. WhatsApp opens with a prefilled order/catering message.
3. Staff captures intent, date, party size, collection/delivery, budget, and dietary notes.
4. Enquiry is logged with source and site.
5. Confirmed orders trigger a review request.

Backend target:

- `whatsappEnquiries`
- `customers`
- `conversations`
- `messages`

Minimum enquiry fields:

- `groupId`
- optional `siteId`
- optional `whatsappAccountId`
- `customerName`
- optional `phone`
- `source`
- `need`
- `stage`
- optional `valueCents`
- `notes`

## 5. Connect Google Later

Google Business Profile is useful, but it should not block tenant onboarding.

Minimum first-day setup:

- Tenant
- First site
- WhatsApp mode
- Click-to-WhatsApp link
- Enquiry tracker

Connect Google after the tenant can already receive enquiries.

## 6. Admin Checklist

- Tenant created
- Owner membership created
- First site created
- WhatsApp account created
- `All sites` context works
- Branch context filters correctly
- Site tags show in `All sites` views
- Enquiries can be attributed to a site
- Google/Cloud API connections are pending, not blocking

## 7. First Pilot Offer

Pick one clear offer:

- Office lunch trays
- Weekend family platter
- Event catering
- Birthday table package

Track:

- Enquiries
- Quotes
- Confirmed orders/bookings
- Order value
- Review requests sent
- Reviews collected

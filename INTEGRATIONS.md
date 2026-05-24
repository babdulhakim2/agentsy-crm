# Agentsy — backend integration setup

A short, practical guide to wiring up Clerk, Convex, Google Business Profile, WhatsApp Cloud API and OpenRouter.

## 0. Auth

Clerk wraps the app and Convex uses Clerk JWTs through `ConvexProviderWithClerk`.

1. Install dependencies:
   ```
   npm install
   ```
2. Add Clerk keys to `.env.local`:
   ```
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
   CLERK_SECRET_KEY=sk_test_...
   ```
3. In Clerk, enable the Convex integration and copy the Frontend API URL. Set it locally and in Convex:
   ```
   CLERK_JWT_ISSUER_DOMAIN=https://verb-noun-00.clerk.accounts.dev
   npx convex env set CLERK_JWT_ISSUER_DOMAIN https://verb-noun-00.clerk.accounts.dev
   ```
4. Run Convex once so `convex/auth.config.ts` is synced:
   ```
   npx convex dev
   ```

The protected app routes are `/today`, `/customers`, `/reviews`, `/inbox`, `/campaigns`, `/voice`, `/sites`, `/team`, `/settings`, `/host`, `/onboarding`, `/admin`, and customer API routes. The owner-to-restaurant link lives in `users` + `memberships`.

## 1. Platform admin

`/admin` (a separate route, outside the operator shell) lets you onboard new restaurants and see the full tenant list. Each onboarding writes a `groups` row + first `sites` row in one mutation:

```
npx convex run admin:onboardRestaurant '{
  "name": "New Wok's Cooking",
  "timezone": "Europe/London",
  "firstBranchName": "Islington",
  "firstBranchAddress": "220 Upper Street, London N1 1RU",
  "ownerName": "Juliet",
  "ownerEmail": "juliet@newwokscooking.co"
}'
```

After Convex auth is wired, only addresses listed in the `platformAdmins` table will be allowed to call `admin:*`. For now the mutation is open — protect it with `npx convex env set ADMIN_TOKEN <secret>` and a guard if you want before sharing.

A restaurant can have many branches. The Sites page (`/sites`) has an "Add a branch" sheet that calls `sites:addBranch`.

## 2. Convex

```
npm install
npx convex dev
```

The first run logs you in and creates a deployment. It prints a `NEXT_PUBLIC_CONVEX_URL` — copy that into `.env.local`. The CLI keeps running and hot-reloads functions as you edit.

Seed realistic UK demo CRM data (fictional/reserved contacts, not live PII):

```
npx convex run seed:londonRestaurantDemo
```

Legacy fallback for API routes that still need a fixed tenant id:

```
npx convex run groups:ensureDefault '{"name":"New Wok's Cooking","timezone":"Europe/London"}'
```

Copy the returned `_id` into `DEFAULT_GROUP_ID` in `.env.local`. Set the same value inside Convex too:

```
npx convex env set DEFAULT_GROUP_ID j9712xxx...
```

Now create your sites:

```
npx convex run sites:create '{"groupId":"<DEFAULT_GROUP_ID>","name":"Islington","address":"220 Upper Street, London N1 1RU"}'
```

## 3. OpenRouter (Gemini)

Get a key at <https://openrouter.ai/keys>, then:

```
npx convex env set OPENROUTER_API_KEY sk-or-v1-...
```

The default model is `google/gemini-2.5-flash`. Edit `convex/ai.ts` if you want to swap.

## 4. Google Business Profile

1. Go to <https://console.cloud.google.com/apis/credentials>, create an OAuth 2.0 Web Client.
2. Authorized redirect URI: `https://<your-convex>.convex.site/oauth/google/callback`
3. Enable the **My Business** APIs (Account Management + Business Information + Business Profile Performance).
4. Set the secrets in Convex:
    ```
    npx convex env set GOOGLE_CLIENT_ID xxx
    npx convex env set GOOGLE_CLIENT_SECRET xxx
    npx convex env set GOOGLE_REDIRECT_URI https://<your-convex>.convex.site/oauth/google/callback
    ```

Use the Convex HTTP site URL for callbacks. The function client URL ends in `.convex.cloud`, but HTTP routes such as `/oauth/google/callback` are served from `.convex.site`.

To start a connection from the UI, call the `google.startOAuth` action; it returns a `url` to redirect the browser to. After consent, Google redirects to the Convex callback which stores the tokens.

To pull reviews:

```
npx convex run google:syncReviews '{"groupId":"<id>","siteId":"<id>"}'
```

## 5. WhatsApp Cloud API (Meta)

1. Create a Meta business app and add the WhatsApp product.
2. Generate a **system user permanent access token** with `whatsapp_business_messaging` and `whatsapp_business_management` scopes.
3. Note your Phone Number ID and Business Account ID.
4. Set in Convex:
    ```
    npx convex env set WHATSAPP_TOKEN EAAxxxx
    npx convex env set WHATSAPP_PHONE_NUMBER_ID 12345
    npx convex env set WHATSAPP_WEBHOOK_VERIFY_TOKEN any-random-string
    ```
5. In Meta's webhook config:
    - Callback URL: `<YOUR_CONVEX_URL>/webhooks/whatsapp`
    - Verify token: same string as above
    - Subscribe to `messages` events.
6. Submit your message templates for approval (`booking_reminder_24h`, `win_back_60d`, etc.). Free-text replies only work inside the 24h customer-initiated window.

To send:

```
npx convex run whatsapp:sendText '{"groupId":"<id>","guestId":"<id>","body":"Hi Sarah — see you Thursday at 7."}'
```

## 6. Quick capture flow

The QuickAddCustomer sheet on `/customers`, `/today`, and `/host` posts to `/api/customers/quick-add`, which calls `customers.quickAdd` in Convex with `consent.source = host_stand | manual | qr | booking_widget`. Until you wire Convex, the same UI works in local-state mode for design review.

## 7. What's stubbed vs. real

| Area | Status |
|---|---|
| Convex schema + functions | Real, ready to deploy |
| OpenRouter draft generation | Real, calls Gemini Flash |
| Google OAuth + callback | Real, tested against the GBP v4 API |
| GBP review sync + reply | Real |
| WhatsApp send (text + template) | Real, Meta Cloud API |
| WhatsApp inbound webhook | Real, drafts AI suggestion staged for owner |
| Customer unification (phone-keyed) | Real |
| Quick-capture sheet | Real, falls back to local state when Convex isn't wired |
| Auth (owner sign-in) | Real Clerk app/session context; Convex validates Clerk JWTs once `CLERK_JWT_ISSUER_DOMAIN` is set |
| Onboarding persistence | Real for Clerk + Convex; also writes local tenant state so the UI works before backend envs are present |
| Booking provider sync (ResDiary etc.) | Not implemented |
| POS sync | Not implemented |

## 8. Operational gotchas

- **Free WA messages**: replies inside the 24h customer-initiated window are free. Outside that window, you must use an approved template.
- **GBP review limits**: GBP returns ~50 reviews per call; we paginate via `nextPageToken` if you implement that on the action.
- **Refresh tokens**: Google's refresh tokens are issued only on first consent. If a user reconnects without `prompt=consent`, you won't get a new refresh token.
- **AI safety**: review replies and WhatsApp suggestions are staged for the owner, never auto-sent. Don't change that default.

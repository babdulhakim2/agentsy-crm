# Customer import

Use `customers:seedContacts` to import real contacts into Convex. The mutation is idempotent by restaurant and normalized phone number, so rerunning the same file updates existing customers instead of duplicating them.

## Production import

1. Deploy the latest Convex schema and functions:

```sh
npx convex deploy
```

2. Set a one-off import secret on the production Convex deployment:

```sh
npx convex env set CUSTOMER_SEED_SECRET "replace-with-a-long-random-value"
```

3. Keep the contact payload outside git, then run:

```sh
npx convex run --prod customers:seedContacts "$(cat /path/to/customer-import.json)"
```

The JSON file should include the secret:

```json
{
  "seedSecret": "replace-with-a-long-random-value",
  "business": "New Woks Cooking",
  "contacts": [
    {
      "date": "2026-06-18",
      "name": "Example Customer",
      "phone": "07700123456",
      "email": "example@example.com",
      "notes": "Friend referral"
    }
  ]
}
```

If the restaurant name is ambiguous, pass `groupId`. If the contacts belong to a specific branch, pass `siteId`.

## Data mapping

- Phone numbers are normalized to UK E.164 format when possible, e.g. `07700123456` becomes `+447700123456`.
- Existing customers are matched by `(groupId, phone)`.
- Import rows become `lead` pipeline customers with WhatsApp and email consent set to `false`.
- Notes, company, role, address, location, contact date, and source date are preserved on the customer profile.
- Rows without a usable phone number are skipped and reported in the mutation result.

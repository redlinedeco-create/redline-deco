# Supabase setup for the Redline Deco admin panel

Do these steps in order. Everything here is on the free plan.

You need about 15 minutes. The only part I cannot do for you is creating the
account, because it needs your email.

---

## 1. Create the project

1. Go to <https://supabase.com> and sign up (email + password, or GitHub).
2. Click **New project**.
3. Fill in:
   - **Name**: `redline-deco`
   - **Database password**: invent a strong one. **Save it somewhere** — you may
     need it later and Supabase will not show it again.
   - **Region**: pick **Europe West (Paris)** — closest to Algeria.
   - **Plan**: **Free**
4. Click **Create new project**. Wait about 2 minutes while it provisions.

---

## 2. Create the database tables

1. In the left sidebar click **SQL Editor**, then **New query**.
2. Open `supabase/schema.sql` from this project in a text editor, select all,
   copy.
3. Paste into the SQL Editor and click **Run**.
4. You should see a green **Success. No rows returned** message.

If it errors, screenshot the error and send it to me — do not retry blind,
because re-running is safe but a partial error is easier for me to read once.

---

## 3. Check the storage buckets

1. Left sidebar → **Storage** → **Buckets**.
2. You should see two buckets:

   | Bucket | Visibility | What it holds |
   |---|---|---|
   | `media` | **Public** | Project and gallery photos |
   | `quote-attachments` | **Private** | Photos and plans sent with a quote request |

Both are created by `schema.sql`. If one is missing, create it by hand: click
**New bucket**, type the name exactly as above, and turn **Public bucket** on
only for `media`. The quote bucket must stay private — the admin inbox reads
those files through short-lived signed links, so there is no public URL for a
customer's documents.

This is where your project photos live. The current 148 photos in
`public/images/` are not uploaded yet — that happens in step 6.

---

## 4. Create your login

1. Left sidebar → **Authentication** → **Users** → **Add user**.
2. Fill in your email and a strong password.
3. **Tick "Auto Confirm User"** — without this you cannot sign in, because
   Supabase otherwise emails you a confirmation link.

This is the only account that can open `/admin`.

---

## 5. Copy your keys

1. Click the **gear icon** at the bottom of the sidebar → **API**.
2. Copy these three values:

   | What you need | Where it is on the page |
   |---|---|
   | Project URL | **Project URL** |
   | Public key | **Project API keys** → `anon` `public` |
   | Admin key | **Project API keys** → `service_role` (click **Reveal**) |

3. Create a file named **`.env.local`** in the project root — the folder that
   contains `package.json` — with these three lines:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...
   ```

   `.env.local` is already in `.gitignore`, so it will never be committed.

> **Treat the `service_role` key like a password.** It bypasses all database
> security rules. Anyone holding it can read and change everything on the site.
> Never paste it into a chat, a screenshot, or anywhere public. Send it to me
> only by writing it into `.env.local` yourself — do not type it into our
> conversation.

---

## 6. Upload your photos

**Not written yet — I am building this now.** When it is ready you will run:

```bash
node scripts/migrate-to-supabase.mjs
```

It uploads the 148 photos to the `media` bucket and seeds the projects,
prices, services, testimonials and site text from the current `data/*.ts`
files. Roughly 250 MB, so expect it to take a while.

---

## 7. Restart the site

```bash
npm run dev
```

The site reads from Supabase and falls back to the existing `data/*.ts` files if
Supabase is unreachable, so it keeps working either way.

---

## 8. Read your enquiries

Open `/admin` and sign in, then click the **Requests** tab. Everything sent
through the quote form and the contact form on `/contact` lands there, newest
first, with a reference like `RD-7K3M2P`.

- The badge on the tab counts the requests still marked **New**.
- Each entry has a status selector (new / in progress / won / lost / spam), a
  private note, the customer's phone, email and WhatsApp, and links to any
  photos or plans they attached.
- Deleting an entry also deletes that customer's files.

The inbox only works if `SUPABASE_SERVICE_ROLE_KEY` is in `.env.local`. If it
is missing, the forms say so and offer WhatsApp and email instead of pretending
the message was sent — nothing is ever silently dropped.

---

## Still outstanding

- `public/images/cover.png` — the 1536×1024 cover photo needs to be copied back
  from wherever you originally got it. I deleted it by mistake during cleanup.
- The before/after slider still shows placeholder images. I cannot tell which of
  your photos are genuine before/after pairs, so I did not guess. Tell me which
  two files form a pair and I will wire them up.

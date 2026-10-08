# Deployment guide

**Target setup**

```
Visitor's browser
   │  https://your-site.vercel.app           (React app, static files)
   ▼
Vercel / Netlify ── /api/* proxied ──▶ Render / Railway (Express API) ──▶ MongoDB Atlas
                                              │
                                              └──▶ Cloudinary (images, resume)  +  Resend (email)
```

The site proxies `/api/*` to the API, so the browser only ever talks to **one origin**. That keeps the login cookie first-party, which is what makes admin login work in Safari and other browsers that block cross-site cookies.

> Pricing and free-plan rules change often. The notes below were checked in October 2026; confirm on each provider's pricing page before you rely on them.

## Before you start

You need free accounts on: **GitHub**, **MongoDB Atlas**, **Cloudinary**, **Resend** (email), **Render** (or Railway) and **Vercel** (or Netlify).

Choose a region close to your visitors and keep the API and database in the same area (for India, Render's Singapore region and an Atlas region nearby).

## 1. Push the project to GitHub

```bash
git init
git add .
git commit -m "Portfolio"
git branch -M main
git remote add origin https://github.com/<you>/<repo>.git
git push -u origin main
```

Check that no `.env` file is in the repository (`.gitignore` already excludes them) and that both `package-lock.json` files are committed.

## 2. MongoDB Atlas (database)

1. Create a **free M0 cluster** (512 MB storage).
2. **Database Access → Add New Database User**: choose password authentication, a strong password, and the built-in role **Read and write to any database** (or a custom role limited to the `portfolio` database).
3. **Network Access → Add IP Address**. Free hosts do not have a fixed outbound IP, so use **Allow access from anywhere (`0.0.0.0/0`)**. This is acceptable only with a strong database password; if you later move to a host with a static IP, restrict it.
4. **Connect → Drivers** and copy the connection string. Add the database name and URL-encode special characters in the password (`@` becomes `%40`, `#` becomes `%23`):

   ```
   mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/portfolio?retryWrites=true&w=majority
   ```

## 3. Cloudinary (images and resume)

Render's free disk is wiped on every deploy and restart, so uploads must live elsewhere.

1. Create an account and open the **Dashboard**.
2. Copy **Cloud name**, **API key** and **API secret**. They go into `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY` and `CLOUDINARY_API_SECRET`.

## 4. Email notifications (Resend)

Contact messages are always saved to the database. Email is only a notification.

> **Render's free web services block outbound SMTP (ports 25, 465, 587)**, so Gmail through SMTP will time out there. Use the HTTPS-based option below instead; it works on every host.

1. Create a [Resend](https://resend.com) account and an **API key** → `RESEND_API_KEY`.
2. Set `CONTACT_RECEIVER` to the email address you registered with.
3. Leave `RESEND_FROM` at its default (`Portfolio <onboarding@resend.dev>`). Without a verified domain, Resend only delivers to your own account email, which is exactly what you need here. To send from your own domain, verify it in Resend and set `RESEND_FROM` accordingly.

## 5. Deploy the API

### Option A: Render

**Using the Blueprint (fastest):** in Render choose **New + → Blueprint**, select your repository, and fill in the prompted values from the table below. `render.yaml` already sets the root directory (`server`), build and start commands, health check, `COOKIE_SAMESITE=lax` and `TRUST_PROXY=2`.

**Manually:** **New + → Web Service** → your repo, then:

| Setting | Value |
|---|---|
| Root Directory | `server` |
| Build Command | `npm install --omit=dev` |
| Start Command | `npm start` |
| Health Check Path | `/api/health` |
| Instance type | Free (see the cold-start note below) |

**Environment variables**

| Key | Value |
|---|---|
| `NODE_ENV` | `production` |
| `MONGODB_URI` | Your Atlas connection string |
| `JWT_SECRET` | A random string of 32+ characters (`node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`) |
| `CLIENT_URL` | Your site's URL, e.g. `https://your-portfolio.vercel.app` (set a placeholder now, fix it in step 8) |
| `SITE_URL` | Same as `CLIENT_URL` |
| `COOKIE_SAMESITE` | `lax` |
| `TRUST_PROXY` | `2` |
| `CONTACT_RECEIVER`, `RESEND_API_KEY` | From step 4 |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | From step 3 |

After the deploy finishes, open `https://<your-api>.onrender.com/api/health`. You should see `{"success":true,"status":"ok",...}`.

> **Cold starts:** a free Render web service spins down after 15 minutes without traffic, and the first request afterwards takes about a minute. Free services also share a monthly instance-hour allowance. Upgrading to the paid Starter instance removes the spin-down. Until then, the first visitor after a quiet period may see a slow load or an error with a "Try again" button.

### Option B: Railway

Railway's plans and free credits change; check [railway.com/pricing](https://railway.com/pricing) first.

1. **New Project → Deploy from GitHub repo**, select your repository.
2. In the service **Settings**, set the **Root Directory** to `server`. The start command is `npm start`.
3. Add the same environment variables as above in the **Variables** tab.
4. In **Settings → Networking**, generate a public domain, then check `/api/health` on it.

`TRUST_PROXY=2` and `COOKIE_SAMESITE=lax` also apply here when you use the proxy setup in step 7.

## 6. Create the admin user in production

The seed script needs database access, so run it from your own computer against Atlas. Use `seed:admin`, which **never deletes content**:

```powershell
# Windows PowerShell, from the server folder
$env:MONGODB_URI = "mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/portfolio"
$env:ADMIN_EMAIL = "you@example.com"
$env:ADMIN_PASSWORD = "a-long-unique-password"
npm run seed:admin
```

```bash
# macOS / Linux
MONGODB_URI="..." ADMIN_EMAIL="you@example.com" ADMIN_PASSWORD="..." npm run seed:admin
```

Environment variables set this way override the values in your local `.env` file. After logging in, add your real content from the dashboard, and delete any sample entries you do not want.

## 7. Deploy the frontend

**Before deploying**, replace `YOUR-API-NAME.onrender.com` in `client/vercel.json` (or `client/netlify.toml`) with your API's real host name. These rewrites forward `/api/*` and `/sitemap.xml` to the API, then send every other path to `index.html` so deep links and refreshes work.

### Option A: Vercel

1. **Add New → Project**, import your repository.
2. Set **Root Directory** to `client` (the Vite preset is detected automatically).
3. Add environment variables:

   | Key | Value |
   |---|---|
   | `VITE_API_URL` | `/api` |
   | `VITE_SITE_URL` | Your site URL, e.g. `https://your-portfolio.vercel.app` |

4. Deploy.

### Option B: Netlify

1. **Add new site → Import an existing project**, select your repository.
2. Set **Base directory** to `client`. The build command (`npm run build`) and publish directory (`dist`) come from `netlify.toml`.
3. Add the same two environment variables (`VITE_API_URL=/api`, `VITE_SITE_URL=...`).
4. Deploy.

Vite bakes `VITE_*` variables in at build time, so **redeploy after changing them**.

## 8. Connect the two sides

1. Copy your final site URL (including a custom domain if you add one).
2. On the API service set `CLIENT_URL` and `SITE_URL` to that exact origin: no trailing slash, `https://`. You can list several origins in `CLIENT_URL`, separated by commas (for example the `.vercel.app` URL and your custom domain).
3. The API restarts automatically. Then in `client/public/robots.txt` uncomment the `Sitemap:` line and put in your domain.

## 9. Custom domain (optional)

Add the domain in Vercel/Netlify (**Domains**) and follow its DNS instructions. Then update `CLIENT_URL`, `SITE_URL` and `VITE_SITE_URL` to the new address and redeploy.

## 10. Verify the deployment

Run the smoke test against your **site's** `/api` path (this also tests the proxy):

```bash
node scripts/smoke-test.mjs https://your-portfolio.vercel.app/api
```

Then check by hand:

- [ ] Home page loads, dark-mode toggle works, projects and skills appear
- [ ] `/admin/login` works and stays logged in after a page refresh (try Safari or a private window too)
- [ ] Upload an image on a project; it shows on the public page and its URL starts with `res.cloudinary.com`
- [ ] Upload a resume PDF; the Resume button downloads it
- [ ] Submit the contact form; it appears under **Messages** and an email arrives
- [ ] `https://your-site/sitemap.xml` lists your projects
- [ ] Open a non-existent URL; the 404 page appears

## Alternative: no proxy (cross-site cookies)

If you would rather call the API directly: set `VITE_API_URL=https://<your-api-host>/api` on the frontend, leave `COOKIE_SAMESITE` empty (it defaults to `none` in production) and set `TRUST_PROXY=1` on the API, and remove the `/api` rewrite. **Safari and some privacy settings block these cross-site cookies, so admin login can fail there.** The proxy setup above avoids this.

## Troubleshooting

| Symptom | Likely cause and fix |
|---|---|
| Site shows "Cannot reach the server" | API is asleep (free tier) or down. Open `/api/health` and wait about a minute. |
| Admin login says OK but you are logged out on refresh | Cookie not stored. Use the proxy setup (`VITE_API_URL=/api`, `COOKIE_SAMESITE=lax`) and check `CLIENT_URL` matches the site origin exactly. |
| Browser console: CORS error | `CLIENT_URL` does not match the site origin (check `https`, subdomain, trailing slash). |
| Every visitor gets "Too many requests" | `TRUST_PROXY` is too low, so all traffic looks like one IP. Use `2` when the site proxies the API. |
| API exits at startup: "Missing required environment variables" | `MONGODB_URI` or `JWT_SECRET` not set on the host. |
| API cannot connect to MongoDB | Atlas Network Access does not allow the host's IP, or the password has unencoded special characters. |
| Contact form works but no email arrives | Check the API logs for "Contact email failed". On Render free, SMTP is blocked: use Resend. With the default sender you can only email your own Resend account address. |
| Uploaded images disappear after a deploy | Cloudinary variables are missing, so files went to the temporary disk. |
| Refreshing `/blog/my-post` shows a 404 page from the host | The SPA fallback rewrite is missing (check `vercel.json` / `netlify.toml` is in the Root/Base directory). |
| Resume button shows an error | No resume uploaded yet (Admin → Profile & resume) or `RESUME_URL` points nowhere. |

## Updating the site later

- **Content:** use the admin dashboard; no redeploy is needed.
- **Code:** push to `main`; Vercel/Netlify and Render rebuild automatically.
- **Backups:** the free Atlas tier has no automated backups. Export occasionally with `mongodump`, or upgrade the cluster.

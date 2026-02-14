# Deploy PlanMyStay on Render and fix 400 error

Your app is live at **https://planmystay1.onrender.com/**. A **400 error** after deployment usually means the server is running but **environment variables are missing** on Render (especially **MONGODB_URI**). Render does **not** use a `.env` file; you must set variables in the Render Dashboard.

---

## Step 1: Set environment variables on Render

1. Go to [Render Dashboard](https://dashboard.render.com/) and open your **planmystay1** service.
2. Click **Environment** in the left sidebar.
3. Add these variables (use **Add Environment Variable**):

| Key | Value | Notes |
|-----|--------|--------|
| `MONGODB_URI` | Your MongoDB connection string | **Required.** Use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and copy the connection string (e.g. `mongodb+srv://user:pass@cluster.mongodb.net/planmystay?retryWrites=true&w=majority`). |
| `SESSION_SECRET` | A long random string | **Required.** e.g. generate with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `NODE_ENV` | `production` | So the app uses production settings. |
| `MAP_TOKEN` | Your Mapbox public token | Optional for maps; get from [Mapbox](https://account.mapbox.com/). |
| `CLOUDINARY_CLOUD_NAME` | Your Cloudinary cloud name | Optional for image uploads. |
| `CLOUDINARY_API_KEY` | Your Cloudinary API key | Optional. |
| `CLOUDINARY_API_SECRET` | Your Cloudinary API secret | Optional. |

4. Click **Save Changes**. Render will redeploy automatically.

---

## Step 2: Use MongoDB Atlas (recommended for production)

1. Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a database user and note username/password.
3. In **Network Access**, add **0.0.0.0/0** (allow from anywhere) so Render can connect.
4. In **Database** → **Connect** → **Drivers**, copy the connection string.
5. Replace `<password>` with your database user password.
6. Paste this as **MONGODB_URI** in Render Environment (Step 1).

Example (replace `USER`, `PASSWORD`, and cluster host with your Atlas values):
```text
mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/planmystay?retryWrites=true&w=majority
```
**Important:** Include the database name `/planmystay` before the `?` so the app uses the correct database.

---

## Sign-in and logout on Render

Sessions are now stored in **MongoDB** (via `connect-mongo`), not in memory. So:

- **MONGODB_URI** and **SESSION_SECRET** must both be set on Render.
- Login and logout will persist across deploys and restarts.

If sign-in or logout still fails, check that **SESSION_SECRET** is set and that **MONGODB_URI** is correct (same Atlas cluster and database).

---

## Step 3: Local .env (optional, for development only)

For local development you can use a `.env` file (same variable names as above):

1. Copy the example file:
   ```bash
   copy .env.example .env
   ```
2. Edit `.env` and set `MONGODB_URI`, `SESSION_SECRET`, and any optional keys.
3. **Do not commit `.env`** to Git; it is in `.gitignore`.

On Render you **must** set these in the **Environment** tab; the `.env` file is not used there.

---

## Why you were seeing 400

- Without **MONGODB_URI** on Render, the app falls back to `mongodb://127.0.0.1:27017/planmystay`, which does not exist on Render’s servers.
- Some requests then hit the database and fail (e.g. invalid ID or connection errors), and the error handler can return **400**.
- After setting **MONGODB_URI** (and **SESSION_SECRET**) and redeploying, the 400 error should go away and https://planmystay1.onrender.com/ should load correctly.

---

## Changes made in the codebase

- **Trust proxy** enabled so the app works correctly behind Render’s HTTPS proxy.
- **Session cookies** set to `secure` in production so login works on HTTPS.
- **MAP_TOKEN** passed safely to templates so missing env doesn’t break the page.
- **.env.example** added as a reference for local and production variables.
- **dotenv** loaded when a `.env` file exists (local); on Render, only Dashboard env vars are used.

After updating Environment on Render and redeploying, open https://planmystay1.onrender.com/ again to confirm the 400 is resolved.

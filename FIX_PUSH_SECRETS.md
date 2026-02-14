# Fix push rejected (secrets + node_modules)

Run these in **PowerShell** from your repo root (where you ran `git push`):

```powershell
# 1. Stop tracking .env (file stays on your PC, removed from git)
git rm --cached .env

# 2. Stop tracking node_modules (folder stays on your PC, removed from git)
git rm -r --cached node_modules

# 3. Stage the removals and .gitignore
git add .
git status

# 4. Replace the last commit with one that has no secrets/node_modules
git commit --amend -m "Initial commit: PlanMyStay app with OpenShift deployment"

# 5. Push again
git push -u origin main
```

**Important:** If you use the real Mapbox token only in `.env`, keep that file **only on your machine**. Never commit it. After this fix, future commits will ignore `.env` and `node_modules` thanks to `.gitignore`.

**If you already rotated your Mapbox token** (revoked the one that was in .env), create a new token in Mapbox and put it only in your local `.env`.

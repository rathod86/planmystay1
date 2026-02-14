# Push H_project to GitHub – Step by Step

Follow these steps in order. Run commands in **PowerShell** or **Command Prompt** from your project folder.

---

## Step 1: Open the project folder

```powershell
cd C:\Users\Abhishek\Desktop\H_project
```

---

## Step 2: Initialize a new Git repository (only if this folder is not already a git repo)

```powershell
git init
```

*(If you see "Reinitialized" or "already a git repository", that’s fine.)*

---

## Step 3: Add all files (node_modules and .env are ignored by .gitignore)

```powershell
git add .
```

---

## Step 4: Create the first commit

```powershell
git commit -m "Initial commit: PlanMyStay app with OpenShift deployment"
```

---

## Step 5: Create a new repository on GitHub

1. Go to **https://github.com/new**
2. Set **Repository name** (e.g. `H_project` or `planmystay`)
3. Choose **Public**
4. Do **not** add a README, .gitignore, or license (you already have them locally)
5. Click **Create repository**

---

## Step 6: Add GitHub as remote and set main branch

Replace `YOUR_USERNAME` with your GitHub username and `REPO_NAME` with the repo name you used in Step 5:

```powershell
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git
```

Example:

```powershell
git remote add origin https://github.com/Abhishek/H_project.git
```

If your default branch is already `main`, skip the next line. Otherwise:

```powershell
git branch -M main
```

---

## Step 7: Push to GitHub

```powershell
git push -u origin main
```

When asked, sign in with your GitHub username and **Personal Access Token** (not your GitHub password).  
To create a token: GitHub → **Settings** → **Developer settings** → **Personal access tokens** → **Generate new token**.

---

## Summary (copy-paste after editing)

```powershell
cd C:\Users\Abhishek\Desktop\H_project
git init
git add .
git commit -m "Initial commit: PlanMyStay app with OpenShift deployment"
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git
git branch -M main
git push -u origin main
```

Replace `YOUR_USERNAME` and `REPO_NAME` with your actual GitHub username and repository name.

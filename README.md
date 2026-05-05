# 🚀 Render Auto Deploy Engine

A lightweight automation system for creating and deploying Node.js applications to Render using GitHub.

---

## 🧠 Overview

Run a single command:

```bash
node create-app.js <customer-name>
```

And the system will automatically:

1. Create a Git branch (or reuse it if it already exists)
2. Generate a ready-to-run Node.js app
3. Commit and push the code to GitHub
4. Create a Render Web Service (or reuse existing one)
5. Trigger a deployment
6. Provide a live URL

---

## 🏗️ Architecture

```
Customer Input
     ↓
App Generator
     ↓
Git Branch Manager
     ↓
GitHub (push)
     ↓
Render API
     ↓
Live Deployment
```

---

## ⚙️ Requirements

* Node.js 18+
* pnpm / npm
* Git installed
* GitHub repository
* Render account

---

## 🔐 Environment Variables

Create a `.env` file:

```env
GITHUB_OWNER=your-username
GITHUB_REPO=your-repo
GITHUB_TOKEN=your-github-token

RENDER_TOKEN=your-render-token
```

---

## 📦 Install Dependencies

```bash
pnpm install
```

---

## ▶️ Usage

```bash
node create-app.js customer-1
```

---

## 📁 Project Structure

```
apps/
  customer-1/
    index.js
    package.json
    deploy.js
    render.json
```

---

## 🔄 System Behavior

### Git Logic

| Scenario              | Behavior      |
| --------------------- | ------------- |
| Branch exists         | Checkout      |
| Branch does not exist | Create + Push |

---

### Render Logic

| Scenario               | Behavior        |
| ---------------------- | --------------- |
| Service exists         | Trigger deploy  |
| Service does not exist | Create + Deploy |

---

## 📄 Generated Files

### index.js

A minimal Express server:

```js
app.get("/", (req, res) => {
  res.json({ customer: "customer-1", status: "running" });
});
```

---

### package.json

```json
{
  "name": "app-customer-1",
  "scripts": {
    "start": "node index.js"
  },
  "dependencies": {
    "express": "^4.18.2"
  }
}
```

---

### deploy.js

Manual deploy trigger:

```js
const https = require("https");
https.get(process.env.RENDER_DEPLOY_HOOK);
```

---

### render.json

Stores deployment metadata:

```json
{
  "serviceId": "srv-xxxx",
  "url": "https://your-app.onrender.com"
}
```

---

## 🧠 Key Concepts

### Idempotent Execution

Running the script multiple times will NOT:

* Duplicate branches
* Duplicate services

---

### Multi-Customer Isolation

Each customer gets:

* Dedicated Git branch
* Dedicated deployment
* Independent lifecycle

---

## ⚠️ Notes

* Ensure your Git repo is already initialized and connected to GitHub
* Make sure your Render token has permission to create services
* The first deployment may take longer due to build time

---

## 🚀 Future Improvements

* Deployment status tracking
* Retry & rollback system
* Database-backed service registry
* Multi-framework support (React, Angular, etc.)
* CI/CD pipeline integration

---

## 🎯 Summary

This project acts as a mini deployment platform:

* Automates Git workflows
* Automates Render provisioning
* Enables per-customer deployments

A foundation for building your own PaaS-like system.

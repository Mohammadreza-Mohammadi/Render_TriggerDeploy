import fetch from "node-fetch";
import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import simpleGit from "simple-git";

const git = simpleGit();



const GITHUB_TOKEN =process.env.GITHUB_TOKEN; 

const GITHUB_OWNER =process.env.GITHUB_OWNER;
const GITHUB_REPO =process.env.GITHUB_REPO; 


const RENDER_TOKEN =process.env.RENDER_TOKEN; 
console.log(RENDER_TOKEN);
const res = await fetch("https://api.render.com/v1/owners", {
  headers: {
    Authorization: `Bearer ${RENDER_TOKEN}`,
  },
});

const ownerids = await res.json();
console.log(ownerids);

const RENDER_OWNER_ID = ownerids[0].owner.id;


async function createApp(customer) {

    const branch = `customer-${customer}`;

  console.log("🚀 Creating app:", customer);

  const dir = path.join("apps", customer);
  fs.mkdirSync(dir, { recursive: true });

  // 1. generate files
  generateFiles(dir, customer);

  // 2. git branch
  await createBranch(branch);

  // 3. commit + push
  await commitAndPush(branch);
  // 2. create folder locally linux base system
  // execSync(`mkdir apps/${customer}`);

  // 3. create deploy.js
  execSync(`
echo "const https = require('https');
https.get(process.env.RENDER_DEPLOY_HOOK);" > apps/${customer}/deploy.js
  `);

  // 4. create Render service
  const res = await fetch("https://api.render.com/v1/services", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RENDER_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ownerId: RENDER_OWNER_ID,
      type: "web_service",
      name: `app-${customer}`,
      repo: `https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}`,
      branch,

      serviceDetails: {
        runtime: "node",

        envSpecificDetails: {
          buildCommand: "pnpm install",
          startCommand: "node index.js",
        },

        plan: "free"
      }
    }),
  });

  const data = await res.json();

  console.log("✅ Service created:", data);
    console.log("🎉 DONE:", customer);
}


async function createBranch(branch) {
  console.log("🚀 Creating branch:", branch);

  await git.checkoutLocalBranch(branch);

  console.log("📦 Branch created locally");
}

async function commitAndPush(branch) {
  await git.add("./*");
  await git.commit(`init ${branch}`);
  await git.push("origin", branch);

  console.log("📤 Pushed to GitHub:", branch);
}

// ---------------- File Generator ----------------
function generateFiles(dir, customer) {
  // index.js
  fs.writeFileSync(
    path.join(dir, "index.js"),
    `console.log("🚀 App ${customer} running");

const express = require("express");
const app = express();

app.get("/", (req, res) => {
  res.json({ customer: "${customer}", status: "running" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Running on", PORT));
`
  );

  // package.json
  fs.writeFileSync(
    path.join(dir, "package.json"),
    JSON.stringify(
      {
        name: `app-${customer}`,
        version: "1.0.0",
        main: "index.js",
        scripts: {
          start: "node index.js",
        },
        dependencies: {
          express: "^4.18.2",
        },
      },
      null,
      2
    )
  );

  // deploy.js
  fs.writeFileSync(
    path.join(dir, "deploy.js"),
    `const https = require("https");
https.get(process.env.RENDER_DEPLOY_HOOK);`
  );

  // pnpm-lock.yaml (placeholder)
  fs.writeFileSync(path.join(dir, "pnpm-lock.yaml"), "# auto generated");
}
createApp(process.argv[2]);
import fetch from "node-fetch";
import { execSync } from "child_process";
import path from "path";
import simpleGit from "simple-git";
import fs from "fs-extra";


const git = simpleGit();



const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

const GITHUB_OWNER = process.env.GITHUB_OWNER;
const GITHUB_REPO = process.env.GITHUB_REPO;


const RENDER_TOKEN = process.env.RENDER_TOKEN;
console.log(RENDER_TOKEN);
const res = await fetch("https://api.render.com/v1/owners", {
  headers: {
    Authorization: `Bearer ${RENDER_TOKEN}`,
  },
});

const ownerids = await res.json();
console.log(ownerids);

const RENDER_OWNER_ID = ownerids[0].owner.id;


async function createApp(customer,customtext) {

  const branch = `customer-${customer}`;

  console.log("🚀 Creating app:", customer);

  const dir = path.join("apps", customer);
  fs.mkdirSync(dir, { recursive: true });

  // 1. generate files
  generateFiles(dir, customer,customtext);

  // 2. git branch
  await createBranch(branch);
  await copyToRoot(customer);

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
  createOrDeploy(customer, branch);
  console.log("🎉 DONE:", customer);
}
async function createOrDeploy(customer, branch) {
  const serviceId = getExistingServiceId(customer);

  if (serviceId) {
    console.log("♻️ Service exists → deploying...");
    await deployService(serviceId);
    return;
  }

  console.log("🆕 Creating new service...");

  await createRenderService(customer, branch);

}

async function createRenderService(customer, branch) {
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

  fs.writeFileSync(
    `apps/${customer}/render.json`,
    JSON.stringify({
      serviceId: data.id
    }, null, 2)
  );

  console.log("✅ Service created:", data);
}


function getExistingServiceId(customer) {
  const file = `apps/${customer}/render.json`;

  if (!fs.existsSync(file)) return null;

  const data = JSON.parse(fs.readFileSync(file, "utf-8"));
  return data.serviceId;
}
async function deployService(serviceId) {
  const res = await fetch(
    `https://api.render.com/v1/services/${serviceId}/deploys`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RENDER_TOKEN}`,
      },
    }
  );

  const data = await res.json();

  console.log("🚀 Deploy triggered:", data);
}

async function copyToRoot(customer) {
  const src = path.join("apps", customer);
  const dest = "."; // root repo

  await fs.copy(src, dest, {
    overwrite: true,
    errorOnExist: false,
  });

  console.log("📦 Copied apps content to root");
}
async function branchExists(branch) {
  const branches = await git.branch(["-a"]);
  return branches.all.includes(`remotes/origin/${branch}`);
}
async function checkoutOrCreate(branch) {
  const exists = await branchExists(branch);

  if (exists) {
    console.log("♻️ Branch exists → checking out");

    await git.fetch("origin", branch);
    await git.checkout(branch);

  } else {
    console.log("🆕 Branch does not exist → creating");

    await git.checkoutLocalBranch(branch);
    await git.push("origin", branch);
  }

  console.log("✅ Using branch:", branch);
}
async function createBranch(branch) {
  console.log("🚀 Creating branch:", branch);

  await checkoutOrCreate(branch);

  console.log("📦 Branch created locally");
}

async function commitAndPush(branch) {
  await git.add("./*");
  await git.commit(`init ${branch}`);
  await git.push("origin", branch);

  console.log("📤 Pushed to GitHub:", branch);
}

// ---------------- File Generator ----------------
function generateFiles(dir, customer,customText) {
  // index.js
  fs.writeFileSync(
    path.join(dir, "index.js"),
    `console.log("🚀 App ${customer} running");

const express = require("express");
const app = express();

app.get("/", (req, res) => {
  res.json({ customer: "${customer} ${customText}", status: "running" });
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
createApp(process.argv[2],process.argv[3] || '');
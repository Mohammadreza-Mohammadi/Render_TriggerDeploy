const https = require("https");

// اینو از Render Deploy Hook می‌گیری
const DEPLOY_HOOK_URL =process.env.DEPLOY_HOOK_URL;

if (!DEPLOY_HOOK_URL) {
  console.error("❌ Missing RENDER_DEPLOY_HOOK env variable");
  process.exit(1);
}

function deploy() {
  console.log("🚀 Triggering deploy on Render...");

  https
    .get(DEPLOY_HOOK_URL, (res) => {
      const { statusCode } = res;

      if (statusCode >= 200 && statusCode < 300) {
        console.log("✅ Deploy triggered successfully!");
      } else {
        console.log("❌ Deploy failed with status:", statusCode);
      }
    })
    .on("error", (err) => {
      console.error("❌ Error:", err.message);
    });
}

deploy();
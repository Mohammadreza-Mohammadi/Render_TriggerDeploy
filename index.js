console.log("🚀 App app-1 running");

const express = require("express");
const app = express();

app.get("/", (req, res) => {
  res.json({ customer: "app-1 ", status: "running" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Running on", PORT));

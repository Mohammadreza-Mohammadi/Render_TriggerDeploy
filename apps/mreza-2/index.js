console.log("🚀 App mreza-2 running");

const express = require("express");
const app = express();

app.get("/", (req, res) => {
  res.json({ customer: "mreza-2", status: "running" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Running on", PORT));

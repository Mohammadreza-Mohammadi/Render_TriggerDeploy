const express = require("express");

const app = express();
console.log("🔥 FILE STARTED");
app.get("/", (req, res) => {
  res.json({
    message: "Hello from Render 🚀",
    time: new Date().toISOString(),
  });
});

// مهم: Render PORT
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
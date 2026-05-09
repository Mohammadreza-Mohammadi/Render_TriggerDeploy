import express from "express";

const app = express();

console.log("🔥 FILE STARTED");

app.get("/", (req, res) => {
  res.json({
    message: "Hello from Render 🚀 New  شسبیشسیبشسبی 1",
    time: new Date().toISOString(),
  });
});

// Render PORT
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
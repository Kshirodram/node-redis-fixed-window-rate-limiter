const express = require("express");
const rateLimiter = require("./ratelimiter");

const app = express();

app.use(rateLimiter);

app.get("/*", (req, res) => {
  res.json({ status: "OK" });
});

app.listen(3000);

const path = require("path");
const express = require("express");
const app = express(); 
const helmet = require('helmet');

app.use(helmet());

app.use(express.static("public"));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
 });

app.listen(8080, () => {
  console.log("server started on port 8080");
});
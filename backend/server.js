const express = require("express");
const fs = require("fs");
const dataRoute = "./pkgs.json";
const path = require("path");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const port = 9002;

app.get("/", (req, res) => {
  res.redirect(301, '/edit/package');
});
app.get(["/edit/package","/edit/package/:id"], (req, res, next) => {
  res.sendFile(path.join(`${__dirname}/../frontend/index.html`));
});
app.use('/public', express.static(`${__dirname}/../frontend/public`));


app.listen(port, _ => console.log(`http://127.0.0.1:${port}`));
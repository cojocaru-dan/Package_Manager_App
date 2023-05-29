const express = require("express");
const fs = require("fs");
const dataRoute = "./pkgs.json";
const path = require("path");
const fileReaderAsync = require("./fileReader");
const router = require("./router");
const app = express();


app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const port = 9002;

// app.get("/", (req, res) => {
//   res.redirect(301, '/edit/package');
// });

app.get("/edit/package", (req, res, next) => {
  res.sendFile(path.join(`${__dirname}/../frontend/index.html`));
});

app.use('/public', express.static(`${__dirname}/../frontend/public`));

app.use("/api/package", router);

app.get("/edit/package/:id", async (req, res) => {
  console.log(req.params.id);
  const fileData = JSON.parse(await fileReaderAsync(`${__dirname}/pkgs.json`));
  const getPackage = fileData.packages.filter(p => p.id === Number(req.params.id))[0];
  res.send(getPackage);
  res.end();
});

app.listen(port, _ => console.log(`http://127.0.0.1:${port}`));
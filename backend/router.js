const express = require("express");
const fileReaderAsync = require("./fileReader");
const fileWriterAsync = require("./fileWriter");

const router = express.Router();

router.route("/")
    .get(async (req, res) => {
        const fileData = JSON.parse(await fileReaderAsync(`${__dirname}/pkgs.json`));
        res.json(fileData.packages);
        res.end();
    })
    .post(async (req, res) => {
        const fileData = JSON.parse(await fileReaderAsync(`${__dirname}/pkgs.json`));
        const largestId = fileData.packages.reduce((p1, p2) => p1 >= p2.id ? p1 : p2.id, fileData.packages[0].id);
        req.body.id = largestId + 1;
        fileData.packages.push(req.body);
        await fileWriterAsync(`${__dirname}/pkgs.json`, fileData);
        res.json({id: largestId + 1});
        res.end();
    })


router.route("/:id")
    .get(async (req, res) => {
        const fileData = JSON.parse(await fileReaderAsync(`${__dirname}/pkgs.json`));
        const filteredById = fileData.packages.filter((p) => p.id === Number(req.params.id))[0];
        res.send(filteredById);
        res.end();
    })
    .put(async (req, res) => {
        const fileData = JSON.parse(await fileReaderAsync(`${__dirname}/pkgs.json`));
        const filteredById = fileData.packages.filter((p) => p.id === Number(req.params.id))[0];
        const indexOfObj = fileData.packages.indexOf(filteredById);
        // if new object doesn't contain date and version
        if (req.body.releases.length === 0) {
            const unformattedDate = new Date();
            const formattedDate = `${unformattedDate.getFullYear()}-${unformattedDate.getMonth() + 1 < 10 ? `0${unformattedDate.getMonth() + 1}` : `${unformattedDate.getMonth() + 1}`}-${unformattedDate.getDate()}`;
            const versionsArray = filteredById.releases[0].version.split(".")
            const newVersion = versionsArray
                .map((v, idx) => {
                    if (idx === versionsArray.length - 1) {
                        return (Number(v) + 1).toString();
                    } else {
                        return v;
                    }
                })
                .join(".");
            // insert new object at the beginning of releases array
            filteredById.releases.unshift({ date: formattedDate, version: newVersion });
        }
        // if new object contain date and version
        else {
            filteredById.releases.unshift({ date: req.body.releases[0].date, version: req.body.releases[0].version });
        }
        fileData.packages[indexOfObj] = filteredById;
        await fileWriterAsync(`${__dirname}/pkgs.json`, fileData);
        res.json({message: "DONE", updatedObj: filteredById});
        res.end();
    })
    .delete(async (req, res) => {
        const fileData = JSON.parse(await fileReaderAsync(`${__dirname}/pkgs.json`));
        fileData.packages = fileData.packages.filter((p) => p.id !== Number(req.params.id));
        await fileWriterAsync(`${__dirname}/pkgs.json`, fileData);
        res.send("DONE");
        res.end();
    })

module.exports = router;
const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');
const fs = require("fs");

const configJson = JSON.parse(fs.readFileSync("config.json"));

function launchChromeAndRunLighthouse(url, opts, config = null) {
    return chromeLauncher.launch({chromeFlags: opts.chromeFlags}).then(chrome => {
        console.log("Launching lighthouse for " + url);
        opts.lighthouseFlags.port = chrome.port;
        return lighthouse(url, opts.lighthouseFlags, config).then(res => {
            console.log("Parsing report for " + url);
            return chrome.kill().then(() => res.report);
        });
    });
}

const file = configJson.filename;
const today = new Date();
//const folder = configJson.sortByDate ? configJson.writeTo + today.getFullYear() + "/" + (today.getMonth() + 1) + "/" : configJson.writeTo + file.replace("." + configJson.lighthouseFlags.output, "") + "/" + today.getFullYear() + "/" + (today.getMonth() + 1) + "/";
const folder = "./";
const file_prefix = today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate() + "-";
const dest_file = folder + file_prefix + file;

/*
fs.access(dest_file, fs.constants.F_OK | fs.constants.W_OK, (err) => {
  if (err) {
	fs.appendFile(dest_file, "Lighthouse version, Time, URL, redirect URL, Response, PWA, PWE, ACC, BP, SEO", (err) => 
	  {   if (err) { console.log(err); } } );
}});
*/

let resultJson;
let resultString;

configJson.url.forEach(address => {
    console.log("Starting analysis on " + address);
    launchChromeAndRunLighthouse(address, configJson).then(results => {

        console.log("Writing analysis to " + dest_file);
        fs.mkdir(folder, {recursive: true}, (err) => {
            if (!err) {
                resultJson = JSON.parse(results);

                resultString = resultJson.lighthouseVersion + ", " +
                    resultJson.fetchTime + ", " +
                    resultJson.requestedUrl + ", " +
                    resultJson.finalUrl + ", " +
                    resultJson.runtimeError.code + ", " +
                    resultJson.categories.performance.score * 100 + ", " +
                    resultJson.categories.accessibility.score * 100 + ", " +
                    resultJson.categories["best-practices"].score * 100 + ", " +
                    resultJson.categories.seo.score * 100 + ", " +
                    resultJson.categories.pwa.score * 100 + "\n";
                // if file doesn't exist then write headers

                fs.appendFile(dest_file, resultString, (err) => {

                    if (err) {
                        console.log(err);
                    } else {
                        console.log("Analysis saved to " + dest_file);
                        console.log(resultString);
                    }

                });
            } else {
                console.log(err);
            }
        });
    }).catch(err => console.log(err));
});

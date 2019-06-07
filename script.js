const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');
const fs = require("fs");
const async = require("async");

const configJson = JSON.parse(fs.readFileSync("config.json"));

const file = configJson.filename;
const today = new Date();
//const folder = configJson.sortByDate ? configJson.writeTo + today.getFullYear() + "/" + (today.getMonth() + 1) + "/" : configJson.writeTo + file.replace("." + configJson.lighthouseFlags.output, "") + "/" + today.getFullYear() + "/" + (today.getMonth() + 1) + "/";
const folder = "./";
const file_prefix = today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate() + "-";
const dest_file = folder + file_prefix + file;

function launchChromeAndRunLighthouse(url, opts, config = null) {
    return chromeLauncher.launch({chromeFlags: opts.chromeFlags}).then(chrome => {
        console.log("Launching lighthouse for " + url);
        opts.lighthouseFlags.port = chrome.port;
        return lighthouse(url, opts.lighthouseFlags, config).then(res => {
            console.log("Parsing report for " + url);
            resultJson = JSON.parse(res.report);
            if ((res.lhr.categories.performance.score === 0) && (res.lhr.runtimeError.code === "NO_ERROR"))
            {
                console.log(url + " run successfully with 0 performance, rerunning lighthouse");
                launchChromeAndRunLighthouse(url, configJson)
                    .catch(err => {
                        console.log(err)
                    });
            } else {
                writeResults(folder, dest_file, url, resultJson);
            }
            chrome.kill().catch(err => { console.log(err) });
        });
    });
}

function writeResults (folder, dest_file, address, resultJson) {
    console.log("Writing analysis to " + dest_file);
    fs.mkdir(folder, {recursive: true}, (err) => {
        if (!err) {
            resultString = resultJson.lighthouseVersion + ", " +
                resultJson.fetchTime + ", " +
                address + ", " +
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

}

let resultJson;
let resultString;

last = configJson.urls_to_analyze + configJson.offset;
if (configJson.urls_to_analyze + configJson.offset > configJson.url.length ) { last = configJson.url.length; }

console.log("Analyzing " + configJson.url.length + " urls");

//for (let i = configJson.offset; i < last ; i++) {
async.eachSeries(configJson.url, function (address, next) {
    //address = configJson.url[i];
    console.log("Starting analysis on " + address);
    launchChromeAndRunLighthouse(address, configJson)
        .then(results => {next();})
        .catch(err => { console.log(err)});
});

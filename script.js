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
const folder = configJson.sortByDate ? configJson.writeTo + today.getFullYear() + "/" + (today.getMonth() + 1) + "/" : configJson.writeTo + file.replace("." + configJson.lighthouseFlags.output, "") + "/" + today.getFullYear() + "/" + (today.getMonth() + 1) + "/";
const dest = folder + file;

configJson.url.forEach(address => {
  console.log("Starting analysis on " + address);
  launchChromeAndRunLighthouse(address, configJson).then(results => {
	  	
    console.log("Writing analysis to " + dest);
    fs.mkdir(folder, { recursive: true }, (err) => {
      if (err) { console.log(err); }
      else {
		const resultJson = JSON.parse(results);
				
		resultString = resultJson.lighthouseVersion + ", " + 
		resultJson.fetchTime + ", " + 
		resultJson.requestedUrl + ", " + 
		resultJson.finalUrl + ", " + 
		resultJson.runtimeError.code + ", " + 
		resultJson.categories.pwa.score + ", " + 
		resultJson.categories.performance.score + ", " + 
		resultJson.categories.accessibility.score + ", " + 
		resultJson.categories["best-practices"].score + ", " + 
		resultJson.categories.seo.score + "\n" ;
		
        fs.appendFile(dest, resultString, (err) => { 
		
          if (err) { console.log(err); }
          else { console.log("Analysis saved to " + dest) ; console.log (resultString);}  
		  
        });
      }
    });
  }).catch(err => console.log(err));
});
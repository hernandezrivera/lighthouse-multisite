# lighthouse-multisite

Script for parsing multiple sites and getting the basic Google Lighthouse indicators into a csv files.

Uses Google's lighthouse (https://github.com/GoogleChrome/lighthouse) to build a set of reports from the URL list you pass into the configuration file and writes the results into one file.
This project is a fork of this project https://github.com/sahava/multisite-lighthouse

It's a Node.JS script, so you need Node / NPM installed on your machine.

# Setup

After cloning the repo, run 

`npm install`

to install the dependencies.

In `config.json`, edit the following fields:

| Field | Example | Description |
|-------|---------|-------------|
| `url` | `["https://www.google.com/", "https://www.simoahava.com/about-simo-ahava/"]` | Array with list of fully formatted URLs to audit. It comes from the OCHA URLs to audit |

# Configuration file explanation

| Field | Example | Description |
|-------|---------|-------------|
| `lighthouseFlags` | `{"output": "csv", "disableDeviceEmulation": true}` | List of flags to pass to lighthouse. Full list available here: https://github.com/GoogleChrome/lighthouse/blob/8f500e00243e07ef0a80b39334bedcc8ddc8d3d0/typings/externs.d.ts#L52 |
| `chromeFlags` | `["--headless"]` | List of flags to pass to the Chrome launcher. Full list available here: https://peter.sh/experiments/chromium-command-line-switches/ |
| `writeTo` | `"/users/sahava/Desktop/"` | The path where to write the reports - the tool will create the path if it doesn't exist. Remember the trailing slash in the end. |

# Run

Once you've set it up, you can run the audit tool with

`node script.js`

The process will be logged into the console. 

The reports will be written in the format you chose for the `output` key in the configuration, and they will be written in the file you specified in the `writeTo`.
The fields of the output file are:
- Lighthouse version
- Timestamp of the execution
- URL being tested
- URL redirected 
- Response code
- Performance Score (0 to 100)
- Accessibility Score (0 to 100)
- Best Practices (0 to 100)
- SEO Score (0 to 100)
- PWA Score (0 to 100)


# Notes
If the script fails, you will have many Chrome processes running in your computer.
Run ``ASKKILL /IM chrome.exe /F`` in your command line on windows to kill all chrome pending processes (and existing ones! save your chrome work before doing this!).

# TO-DO List
- Read URLs directly from Google Sheet or published CSV from the Google Sheet
- Write the results into the specified folder
const puppeteer = require("puppeteer");
const fetch = require("node-fetch");
const fs = require("fs");
fetch("http://127.0.0.1:9223/json/version")
    .then(r => r.json())
    .then(async wss => {
        const browser = await puppeteer.connect({
            browserWSEndpoint: wss.webSocketDebuggerUrl,
            defaultViewport: null,
        });

        // go to page
        const page = await browser.newPage();
        const responses = [];
        page.on("response", resp => {
            responses.push(resp);
        });

        page.on("load", () => {
            responses.map(async (resp, i) => {
                const request = await resp.request();
                const url = new URL(request.url);

                const split = url.pathname.split("/");
                let filename = split[split.length - 1];
                if (!filename.includes(".")) {
                    filename += ".html";
                }

                const buffer = await resp.buffer();
                fs.writeFileSync(filename, buffer);
            });
        });

        await page.goto("https://beatsaver.com/api/download/key/2144");
    })
    .catch(e => {
        console.log(e);
    });

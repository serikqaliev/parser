const axios = require("axios");
const cheerio = require("cheerio");
const https = require("https");
const fs = require("fs");

const textObj = [];

const agent = new https.Agent({
    rejectUnauthorized: false
});

async function siteCycle() {
    const first = 27000;
    const last = 28000;
    for (let i = first; i <= last; i++) {
        await parser(i, last);
    }
}

// Основная функция парсера

// Передаются в функции siteCycle()
// i – индекс выполнения в цикле
// last - последний индекс
async function parser(i, last) {
    axios.get(`https://www.kaznu.kz/kz/3/news/one/${i}/`, {httpsAgent: agent}).then(html => {
        const $ = cheerio.load(html.data);
        const titleSelector = "#main-content > div.main-content > div > div.kaznu-heading-container.kaznu-heading > h2";
        const dateSelector = "#main-content > div.main-content > div > div.field.field-name-body.field-type-text-with-summary.field-label-hidden > div > div > div.kaznu-datestamp";
        const textSelector = "#main-content > div.main-content > div > div.field.field-name-body.field-type-text-with-summary.field-label-hidden > div > div > div.newsBody.kaznu-content-inner";
        let obj = {
            title: "",
            date: "",
            text: []
        }
        let text = "";
        $(titleSelector).each((i, elem) => {
            obj.title += `${$(elem).text()}`;
        });
        $(dateSelector).each((i, elem) => {
            obj.date += `${$(elem).text()}`;
        });
        $(textSelector).each((i, elem) => {
            text += `${$(elem).text()}`;
        });
        obj.text.push(text.replace(/\s+/g, ' ').trim().split(/\.(?=$|\s+)/));

        if (obj.title !== "" && obj.text !== "") {
            textObj.push(obj);
            console.log(obj);
        }

        if(i === last) {
            let json = JSON.stringify(textObj);
            console.log("json" + json);
            fs.writeFile("text.json", json, () => {
            });
        }
    });
}

void siteCycle();

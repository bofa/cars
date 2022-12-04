const puppeteer = require('puppeteer');
const axios = require('axios');
// const writeJsonFile = require('write-json-file');
const fs = require('fs').promises;

const countries = ['SE', 'DE', 'FI', 'NO', 'FR', 'DK', 'NL', 'CH', 'ES', 'IE', 'GB'];
// const countries = ['FR', 'DK,', 'CH', 'GB'];
// const countries = ['FR'];
// const countries = ['IE'];
// const countries = ['FR'];
// const countries = ['DE', 'FI', 'FR', 'DK', 'CH'];
// const countries = ['NO', 'ES', 'NL'];
// const countries = ['DE'];
// const country = 'SE';
// const country = 'GE';
// const country = 'FI';
// const countries = ['NO'];
// const country = 'FR';
// const countries = ['GB'];
// const country = 'NL';

// const years = [2017, 2018, 2019, 2020];
// const months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
// const years = [2021];
// const months = [1, 2, 3, 4, 5];
const dates = [
    // [2017, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]],
    // [2018, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]],
    // [2019, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]],
    // [2020, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]],
    // [2022, [7, 8]],
    [2022, [9, 10, 11]],
]


// const brands = [
//     { euId: 'E-TRON', carsId: 'Etron' },
//     { euId: 'MODEL 3', carsId: 'MODEL3' },
//     { euId: 'MUSTANG MACH-E', carsId: 'Mach-E' },
//     { euId: '2', carsId: 'Polestar2' },
//     { euId: 'MODEL Y', carsId: 'ModelY' },
//     { euId: 'MODEL S', carsId: 'ModelS' },
//     { euId: 'MODEL X', carsId: 'ModelX' },
//     { euId: 'ID.3', carsId: 'ID3' },
//     { euId: 'ID.4', carsId: 'ID4' },
//     { euId: 'ZOE', carsId: 'Zoe'},
//     { euId: 'UX 300E', carsId: 'UX' },
//     { euId: 'KONA', carsId: 'Kona' },
//     { euId: 'XC40', carsId: 'XC40' },
//     { euId: 'ENYAQ', carsId: 'ENYAQ' },
//     { euId: 'LEAF', carsId: 'Leaf' },
//     { euId: 'IX3', carsId: 'IX3' },
// ];

const key = 'AIzaSyC8N3IAsa8l-D_bEQbEM1G8-ZVhkzWMpKM'

trans = m => m[0].map((x,i) => m.map(x => x[i]));

(async () => {
    // Fetch connections model-brand-manafacturer
    const brands = await axios
        // .get('https://spreadsheets.google.com/feeds/list/1l50qi3FAue2zqMOtc-vdGbXBWpb0I4lKByqUaz2nuFs/1/public/basic?alt=json')
        .get('https://sheets.googleapis.com/v4/spreadsheets/1l50qi3FAue2zqMOtc-vdGbXBWpb0I4lKByqUaz2nuFs/values/Groups?alt=json&key=' + key)
        .then(response => response.data.values
            .slice(1)
            .map((row) => ({
                carsId: row[0],
                euId: row[3],
            }))
            .filter(model => model.euId)
        );
        // .then(response => response.data.feed.entry
        //     .map((row) => ({
        //     model: row.title['$t'],
        //     ...row.content['$t']
        //         .replace(/ /g, '')
        //         .split(',')
        //         .map((r) => r.split(':'))
        //         .filter((r) => r[0].length > 0)
        //         .reduce((obj, r) => {
        //         obj[r[0]] = r[1];
        //         return obj;
        //         }, {})
        //     }))
        //     .map(model => ({ euId: model.euevkey, carsId: model.model }))
        //     .filter(model => model.euId)
        // );

    console.log('brands', brands);

    const browser = await puppeteer.launch();
    const page = await browser.newPage()

    for (let country of countries) {
        const result = [];
        const resultBrands = [];
        for (let d of dates) {
            const year = d[0];
            for (let month of d[1]) {
                const url = 'https://eu-evs.com/bestSellers/' + country + '/Brands/Month/' + year + '/' + month;
                await page.goto(url);

                const rowsModels = await page
                    .$$("#latestDateTable")
                    .then(els => els[1].$$("tbody > tr"))
                    .catch(err => false);

                if (rowsModels) {
                    console.log(country, year, month, 'Data');

                    const columns = await Promise.all(rowsModels.map(el => el.$$("td")));
                    const columnsText = await Promise.all(columns.map(e1 => Promise.all(e1.map(e2 => e2.evaluate(e => e.textContent)))))
    
                    // console.log('columnsText', columnsText);

                    const formatted = columnsText
                        .filter(item => item.length > 0)
                        // .map(item => item.join('\t'))
                        // .join('\n');
                    
                    result.push(formatted);
                } else {
                    console.log(country, year, month, 'No data models');
                }

                // Parse brands
                const rowsBrands = await page
                    .$$("#latestDateTable")
                    .then(els => els[0].$$("tbody > tr"))
                    .catch(err => false);

                if (rowsBrands) {
                    console.log(country, year, month, 'Data');

                    const columns = await Promise.all(rowsBrands.map(el => el.$$("td")));
                    const columnsText = await Promise.all(columns.map(e1 => Promise.all(e1.map(e2 => e2.evaluate(e => e.textContent)))))
    
                    // console.log('columnsText', columnsText);

                    const formatted = columnsText
                        // .filter(item => item.length > 0)
                        // .map(item => item.join('\t'))
                        // .join('\n');
                    
                    resultBrands.push({
                        year,
                        month,
                        formatted,
                    });
                } else {
                    console.log(country, year, month, 'No data brands');
                }
            }
        }

        // console.log('result', result)
        
        const total = result.map(r => r.map(c => Number(c[2])).reduce((s, c) => s + c))

        const transpose = brands
            .map(b => [b.carsId, ...result.map(r => r.find(c => c[1].startsWith(b.euId))?.[2] || '0')])
            .concat([['total', ...total]])

        await fs.mkdir('scrape/output/', { recursive: true });
        await fs.writeFile('scrape/output/' + country + '.txt', trans(transpose).map(row => row.join('\t')).join('\n'));
        await fs.writeFile('scrape/output/' + country + '.json', JSON.stringify(resultBrands));
    }

    await browser.close();
})();

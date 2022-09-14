const fs = require('fs').promises;
const data = require('./acea-2022-03.json');
// https://www.acea.auto/pc-registrations/passenger-car-registrations-29-5-five-months-into-2021-53-4-in-may/

const contries = [
    { name: 'Sweden', id: '96' },
    { name: 'Denmark', id: '77' },
    { name: 'Spain', id: '95' },
    { name: 'Switzerland', id: '100' },
    { name: 'Ireland', id: '84' },
    { name: 'Netherlands', id: '89' },
    { name: 'Finland', id: '79' },
    { name: 'Germany', id: '81' },
    { name: 'France', id: '80' },
    { name: 'Norway', id: '99' },
];

const values = contries.map(c => {
    const records = data.dataStore.records;
    const keys = Object.keys(records)
        .filter(k => k.includes(c.id));

    const values = keys
        .map(k => ({ ...records[k], key: k }))
        .map(r => r.value);

    // values.forEach(v => console.log(v));

    return {
        ...c,
        values,
    };
});

console.log('values', values);

Promise.all(values.map(c => fs.writeFile('scrape/output-total-sales/' + c.name + '.txt', c.values.join('\n'))))
    .then(() => console.log('Write complete'));

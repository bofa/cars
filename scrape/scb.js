import { DateTime } from "luxon";

const query3 = (id) => ({
  "query": [
    {
      "code": "Bransleslag",
      "selection": {
        "filter": "item",
        "values": [id]
      }
    },
    {
      "code": "Varuflode",
      "selection": {
        "filter": "item",
        "values": [
          "F6"
        ]
      }
    }
  ],
  "response": {
    "format": "json"
  }
})

// https://api.scb.se/OV0104/v1/doris/sv/ssd/START/EN/EN0107/EN0107X/VaruflodBransle

export default function getPetrolStatisticsSweden(axios) {
  const requests = [
    { id: '10', label: 'Petroleum' },
    // { id: '15', label: 'E85' },
    { id: '20', label: 'Diesel dutiable' },
    { id: '50', label: 'Jet Fuel' },
    // { id: '06c', label: 'Jet fuel' },
  ].map(({ id, label }) => {
    // const req$ = axios.post('https://api.scb.se/OV0104/v1/doris/sv/ssd/START/EN/EN0107/EN0107X/EnBal', query2(id));
    const req$ = axios.post('https://api.scb.se/OV0104/v1/doris/sv/ssd/START/EN/EN0107/EN0107X/VaruflodBransle',
      query3(id)
    );
    // const req$ = axios.post('https://api.scb.se/OV0104/v1/doris/sv/ssd/START/EN/EN0107/EN0107X/UtLevBioM', query(id));
    
    // req$.then((r: any) => console.log('gurkburk', r.data));

    return req$
      .then((r) => r.data.data
        .map((d) => ({ t: DateTime.fromFormat(d.key[2], "yyyy'M'MM", { zone: 'utc' }), y: Number(d.values[0]) / 1000 })))  
      .then((data) => ({ label, data }));
  })

  return Promise.all(requests);
}
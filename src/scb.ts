// import axios from 'axios';
// import * as moment from 'moment';
// import { Series } from './Chart';

const query = (id: string) => ({
  'query': [
    {
      'code': 'Varuslag',
      'selection': {
        'filter': 'item',
        'values': [
          id
        ]
      }
    }
  ],
  'response': {
    'format': 'json'
  }
});

const query2 = (id: string) => ({
  "query": [
    {
      "code": "Bransleslag",
      "selection": {
        "filter": "item",
        "values": [id]
      }
    },
    {
      "code": "ContentsCode",
      "selection": {
        "filter": "item",
        "values": [
          "000001GS"
        ]
      }
    }
  ],
  "response": {
    "format": "json"
  }
})

const query3 = (id: string) => ({
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

module.exports = function getPetrolStatisticsSweden(axios: any, moment: any) {
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
      .then((r: any) => r.data.data
        .map((d: any) => ({ t: moment.utc(d.key[2], 'YYYY-MM'), y: Number(d.values[0]) / 1000 })))  
      .then((data: any) => ({ label, data }));

    // return req$.then(reponse => Object.keys(reponse.data.dimension.Tid.category.index).map(key => {
    //     const valueIndex = reponse.data.dimension.Tid.category.index[key];

    //     return {
    //         t: moment(key, 'YYYY-MM'),
    //         y: reponse.data.value[valueIndex],
    //     };
    // }))
    // .then(data => ({
    //     label,
    //     data,
    // }) as Series)
  })

  return Promise.all(requests);
}
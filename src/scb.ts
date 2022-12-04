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

module.exports = function getPetrolStatisticsSweden(axios: any, moment: any) {
  const requests = [
    { id: '10', label: 'Petroleum' },
    { id: '15', label: 'E85' },
    { id: '20', label: 'Diesel dutiable' },
    // { id: '06c', label: 'Jet fuel' },
  ].map(({ id, label }) => {
    const req$ = axios.post('https://api.scb.se/OV0104/v1/doris/sv/ssd/START/EN/EN0107/EN0107X/UtLevBioM', query(id));

    // req$.then((d: any) => console.log('gurkburk', d));

    return req$
      .then((r: any) => r.data.data
        .map((d: any) => ({ t: moment(d.key[1], 'YYYY-MM'), y: Number(d.values[0]) / 1000 })))  
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
import axios from 'axios';
import * as moment from 'moment';
import { Series } from './Chart';

const query = (index: string) => ({
    'query': [
      {
        'code': 'Region',
        'selection': {
          'filter': 'item',
          'values': [
            '0'
          ]
        }
      },
      {
        'code': 'Kjopegrupper',
        'selection': {
          'filter': 'item',
          'values': [
            '00'
          ]
        }
      },
      {
        'code': 'PetroleumProd',
        'selection': {
          'filter': 'item',
          'values': [
            index
          ]
        }
      },
      {
        'code': 'Tid',
        'selection': {
          'filter': 'all',
          'values': [
            '*'
          ]
        }
      }
    ],
    'response': {
      'format': 'json-stat2'
    }
  });

export function getPetrolStatisticsNorway() {
  const requests = [
    { id: '03', label: 'Petroleum' },
    { id: '04a', label: 'Diesel duty free' },
    { id: '04b', label: 'Diesel dutiable' },
    { id: '06c', label: 'Jet fuel' },
  ].map(({ id, label }) => {
    const req$ = axios.post('https://data.ssb.no/api/v0/en/table/11174/', query(id));

    req$.then(d => console.log('gurkburk', d));

    return req$.then(reponse => Object.keys(reponse.data.dimension.Tid.category.index).map(key => {
        const valueIndex = reponse.data.dimension.Tid.category.index[key];

        return {
            t: moment(key, 'YYYY-MM'),
            y: reponse.data.value[valueIndex],
        };
    }))
    .then(data => ({
        label,
        data,
    }) as Series)
  })

  return Promise.all(requests);
}
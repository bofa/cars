import axios from 'axios';
import * as moment from 'moment';
import { Series } from './Chart';

const query = {
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
            '03',
            '04b'
          ]
        }
      },
      {
        'code': 'Tid',
        'selection': {
          'filter': 'item',
          'values': [
            '2014M01',
            '2014M02',
            '2014M03',
            '2014M04',
            '2014M05',
            '2014M06',
            '2014M07',
            '2014M08',
            '2014M09',
            '2014M10',
            '2014M11',
            '2014M12',
            '2015M01',
            '2015M02',
            '2015M03',
            '2015M04',
            '2015M05',
            '2015M06',
            '2015M07',
            '2015M08',
            '2015M09',
            '2015M10',
            '2015M11',
            '2015M12',
            '2016M01',
            '2016M02',
            '2016M03',
            '2016M04',
            '2016M05',
            '2016M06',
            '2016M07',
            '2016M08',
            '2016M09',
            '2016M10',
            '2016M11',
            '2016M12',
            '2017M01',
            '2017M02',
            '2017M03',
            '2017M04',
            '2017M05',
            '2017M06',
            '2017M07',
            '2017M08',
            '2017M09',
            '2017M10',
            '2017M11',
            '2017M12',
            '2018M01',
            '2018M02',
            '2018M03',
            '2018M04',
            '2018M05',
            '2018M06',
            '2018M07',
            '2018M08',
            '2018M09',
            '2018M10',
            '2018M11',
            '2018M12',
            '2019M01',
            '2019M02',
            '2019M03',
            '2019M04',
            '2019M05',
            '2019M06',
            '2019M07',
            '2019M08',
            '2019M09',
            '2019M10',
            '2019M11',
            '2019M12',
            '2020M01',
            '2020M02',
            '2020M03',
            '2020M04',
            '2020M05',
            '2020M06',
            '2020M07',
            '2020M08',
            '2020M09',
            '2020M10',
            '2020M11',
            '2020M12',
          ]
        }
      }
    ],
    'response': {
      'format': 'json-stat2'
    }
  };

export function getPetrolStatistics() {
    const req$ = axios.post('https://data.ssb.no/api/v0/en/table/11174/', query);

    req$.then(d => console.log('gurkburk', d));

    return req$.then(reponse => Object.keys(reponse.data.dimension.Tid.category.index).map(key => {
        const valueIndex = reponse.data.dimension.Tid.category.index[key];

        return {
            t: moment(key, 'YYYY-MM'),
            y: reponse.data.value[valueIndex],
        };
    }))
    .then(data => ({
        label: 'Petroleum Million Liters',
        data,
    }) as Series);
}
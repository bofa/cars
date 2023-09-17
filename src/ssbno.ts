import axios from 'axios';
import { Series } from './Chart';
import { DateTime } from 'luxon';

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

const oldNewMap = {
  "Petroleum": "Motor gasoline",
  "Diesel duty free": "Auto diesel, free of duty",
  "Diesel dutiable": "Auto diesel, dutiable",
  "Jet fuel": "Jet kerosene",
}

export function getPetrolStatisticsNorway() {
  return Promise.all([getPetrolStatisticsNorwayOld(), getNorwayNew()]).then((values) => {
    const oldData = values[0];
    const newData = values[1];
    
    const output = oldData
      .map(s => ({
        label: s.label,
        data: s.data
          .concat(newData.find(s2 => s2.label === oldNewMap[s.label])?.data || [])
      }))
    
    return output;
  })
}

function getPetrolStatisticsNorwayOld(): Promise<Series[]> {
  const requests = [
    { id: '03', label: 'Petroleum' },
    { id: '04a', label: 'Diesel duty free' },
    { id: '04b', label: 'Diesel dutiable' },
    { id: '06c', label: 'Jet fuel' },
  ].map(({ id, label }) => {
    const req$ = axios.post('https://data.ssb.no/api/v0/en/table/11174/', query(id));

    // req$.then(d => console.log('gurkburk', d));

    return req$.then(reponse => Object.keys(reponse.data.dimension.Tid.category.index).map(key => {
        const valueIndex = reponse.data.dimension.Tid.category.index[key];

        return {
          t: DateTime.fromFormat(key, "yyyy'M'MM"),
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

function getNorwayNew(): Promise<Series[]> {
  return axios.post('https://data.ssb.no/api/v0/en/table/13585/', {
    "query": [
      {
        "code": "Produkter",
        "selection": {
          "filter": "item",
          "values": [
            "01",
            "02a",
            "02b",
            "06"
          ]
        }
      },
      {
        "code": "ContentsCode",
        "selection": {
          "filter": "item",
          "values": [
            "Total"
          ]
        }
      }
    ],
    "response": {
      "format": "json-stat2"
    }
  }).then(r => {
    const data = r.data;  

    const time = Object.keys(data.dimension.Tid.category.index)
      .map(t => DateTime.fromFormat(t, "yyyy'M'MM"))

    const labelsObj = data.dimension.Produkter.category.label;
    const labels: string[] = Object.keys(labelsObj).map(key => labelsObj[key]);
    const values: any[] = data.value;

    const contentLength = values.length / labels.length;

    const datasets = labels.map((label: string, i) => ({
      label,
      data: time.map((t, j) => ({
        t,
        y: values[contentLength * i + j] 
      }))
      .filter(p => p.y)
      // Haxxx, remove duplicate month later
      .slice(1)
    })) as unknown as Series[]

    return datasets;
  })
}

// 11174: Deliveries of petroleum products, by purchaser group and product (mill. litres). Preliminary figures (C) (closed series) 2010M01 - 2022M01

// 13615
// 13615: Deliveries of petroleum products and liquid biofuels, by industry (SIC2007) and product (1000 litres). Final figures (C) 2020 - 2021

// 13585: Deliveries of petroleum products and liquid biofuels, by purchaser group and product (million litres). Preliminary figures 2021M01 - 2023M01
// https://data.ssb.no/api/v0/en/table/13585/
// 13585
// {
//   "query": [
//     {
//       "code": "Produkter",
//       "selection": {
//         "filter": "item",
//         "values": [
//           "01",
//           "02a",
//           "02b",
//           "06"
//         ]
//       }
//     },
//     {
//       "code": "ContentsCode",
//       "selection": {
//         "filter": "item",
//         "values": [
//           "Total"
//         ]
//       }
//     }
//   ],
//   "response": {
//     "format": "json-stat2"
//   }
// }
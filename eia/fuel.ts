const fs = require('fs')
import { DateTime } from 'luxon'

[
  {
    countryId: 'NLD',
    name: 'Netherlands',
  },
  {
    countryId: 'DEU',
    name: 'Germany',
  },
  {
    countryId: 'FRA',
    name: 'France',
  },
  {
    countryId: 'DNK',
    name: 'Denmark',
  },
  {
    countryId: 'SWE',
    name: 'Sweden',
  },
  {
    countryId: 'NOR',
    name: 'Norway',
  },
  {
    countryId: 'FIN',
    name: 'Finland',
  },
].forEach(({ countryId, name }) =>
  Promise.all([
    {
      key: 'gasoline',
      productId: 62,
    },
    {
      key: 'jet',
      productId: 63,
    },
    {
      key: 'diesel',
      productId: 65,
    }
  ].map(({ productId, key }) =>
    fetch(`https://api.eia.gov/v2/international/data/?frequency=annual&data[0]=value&facets[activityId][]=2&facets[productId][]=${productId}&facets[countryRegionId][]=${countryId}&facets[unit][]=MT&sort[0][column]=period&sort[0][direction]=asc&offset=0&length=5000&api_key=TsVtImL6otz3dyW4hKcias01zxPnVymkRSvDq8B2`)
      // axios.get(`https://api.eia.gov/v2/international/data/?frequency=annual&data[0]=value&facets[activityId][]=2&facets[productId][]=${productId}&facets[countryRegionId][]=${countryId}&facets[unit][]=MT&sort[0][column]=period&sort[0][direction]=asc&offset=0&length=5000&api_key=TsVtImL6otz3dyW4hKcias01zxPnVymkRSvDq8B2`)
      .then(respone => respone.json())
      .then<{ period: string, value: string }[]>(body => body.response.data)))
      .then((data) => {
        console.log('data', data)


        const series = data[0].map(({ period }, i) => ({
          x: DateTime.fromFormat(period, 'yyyy'),
          gasoline: Number(data[0][i].value),
          jet: Number(data[1][i].value),
          diesel: Number(data[2][i].value),
          // .filter(d => d.y)
          // .filter(d => d.x.year >= 2000)
          // .flatMap(d => Array(12).fill(0).map((_, i) => ({ x: d.x.plus({ months: i }), y: d.y / 12 })))
        }))

        console.log('countryId', name, series)

        const filename = `./public/fuel/fuel-${name}.json`
        fs.writeFileSync(filename, JSON.stringify(series, null, 2))
        // this.setState(({ countriesFuel }) => ({
        //   countriesFuel: { ...countriesFuel, [name]: (countriesFuel[name] ?? []).concat(series) },
        // }))
      })
  )

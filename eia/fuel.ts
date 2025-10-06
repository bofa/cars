const fs = require('fs')
import { DateTime } from 'luxon'

[
  { "countryId": "ALB", "name": "Albania" },
  { "countryId": "AND", "name": "Andorra" },
  { "countryId": "ARM", "name": "Armenia" },
  { "countryId": "AUT", "name": "Austria" },
  { "countryId": "AZE", "name": "Azerbaijan" },
  { "countryId": "BGR", "name": "Bulgaria" },
  { "countryId": "BIH", "name": "Bosnia and Herzegovina" },
  { "countryId": "BLR", "name": "Belarus" },
  { "countryId": "BEL", "name": "Belgium" },
  { "countryId": "BGR", "name": "Bulgaria" },
  { "countryId": "CZE", "name": "Czechia" },
  { "countryId": "DNK", "name": "Denmark" },
  { "countryId": "EST", "name": "Estonia" },
  { "countryId": "FIN", "name": "Finland" },
  { "countryId": "FRA", "name": "France" },
  { "countryId": "GEO", "name": "Georgia" },
  { "countryId": "DEU", "name": "Germany" },
  { "countryId": "GRC", "name": "Greece" },
  { "countryId": "HUN", "name": "Hungary" },
  { "countryId": "ISL", "name": "Iceland" },
  { "countryId": "IRL", "name": "Ireland" },
  { "countryId": "ITA", "name": "Italy" },
  { "countryId": "KAZ", "name": "Kazakhstan" },
  { "countryId": "KOS", "name": "Kosovo" },
  { "countryId": "LTU", "name": "Lithuania" },
  { "countryId": "LUX", "name": "Luxembourg" },
  { "countryId": "LVA", "name": "Latvia" },
  { "countryId": "MDA", "name": "Moldova" },
  { "countryId": "MKD", "name": "North Macedonia" },
  { "countryId": "MNE", "name": "Montenegro" },
  { "countryId": "MCO", "name": "Monaco" },
  { "countryId": "NLD", "name": "Netherlands" },
  { "countryId": "NOR", "name": "Norway" },
  { "countryId": "POL", "name": "Poland" },
  { "countryId": "PRT", "name": "Portugal" },
  { "countryId": "ROU", "name": "Romania" },
  { "countryId": "RUS", "name": "Russia" },
  { "countryId": "SRB", "name": "Serbia" },
  { "countryId": "SVK", "name": "Slovakia" },
  { "countryId": "SVN", "name": "Slovenia" },
  { "countryId": "ESP", "name": "Spain" },
  { "countryId": "SWE", "name": "Sweden" },
  { "countryId": "CHE", "name": "Switzerland" },
  { "countryId": "TUR", "name": "Turkey" },
  { "countryId": "UKR", "name": "Ukraine" },
  { "countryId": "GBR", "name": "United Kingdom" },
  { "countryId": "MLT", "name": "Malta" },
].reverse().forEach(async ({ countryId, name }, countryIndex) => {
  await sleep(100*countryIndex, null)

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
        // console.log('data', data)

        const series = data[0].map(({ period }, i) => ({
          x: DateTime.fromFormat(period, 'yyyy'),
          gasoline: Number(data[0][i].value),
          jet: Number(data[1][i].value),
          diesel: Number(data[2][i].value),
          // .filter(d => d.y)
          // .filter(d => d.x.year >= 2000)
          // .flatMap(d => Array(12).fill(0).map((_, i) => ({ x: d.x.plus({ months: i }), y: d.y / 12 })))
        }))

        // console.log('countryId', name, series)

        const filename = `./public/fuel/fuel-${name}.json`
        fs.writeFileSync(filename, JSON.stringify(series, null, 2))
        // this.setState(({ countriesFuel }) => ({
        //   countriesFuel: { ...countriesFuel, [name]: (countriesFuel[name] ?? []).concat(series) },
        // }))
      })
      .catch(error => console.error('countryId', error))
})

function sleep<T>(ms: number, resolved: T) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(resolved)
    }, ms)
  })
}

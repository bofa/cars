import { DateTime } from 'luxon'
import { useQueries } from '@tanstack/react-query'
import Chart, { rgba, Series } from './Chart'
import { FuelPoint, MergeSelect } from './MultiMergeSelect'

function Fuel(props: {
  make: keyof Omit<FuelPoint, 'x'>
  smooth: number
  selected: MergeSelect[]
  range: [DateTime, DateTime]
  stacked: boolean
}) {
  const { smooth, selected, range, stacked, make } = props

  const queries = useQueries({
    queries: selected
      .map(group => group.series)
      .flat()
      .filter((country, index, array) => array.indexOf(country) === index)
      .map(country => ({
      queryKey: ['fuelCountry', country],
      queryFn: () => fetchData(country),
    staleTime: Infinity,
    }))
  })

  const data = queries
    .map(query => query.data!)
    .filter(v => v)

  const dataset: Series[] = selected.map((group, index) =>
    (['gasoline', 'jet', 'diesel'] as const).map((fuel, fuelIndex) => {

    const series = mapOutField(group.series, data, fuel, range)

    console.log('gurkburk', series)

    const name = group.name ?? group.series.join()
    const color = rgba(fuelIndex)
    const backgroundColor = rgba(fuelIndex, 0.2)

    return {
      label: name + ' ' + fuel,
      type: 'raw' as const,
      color,
      backgroundColor,
      data: mapSeriesCut(series),
    }
  }))
  .flat()

  console.log('dataset', dataset, data)

  return (
    <Chart
      series={dataset}
      stacked={stacked}
      fitType={'linear'}
      sCurveParams={null}
    />
  )
}

export default Fuel

function mapOutField(
  group: string[],
  data: { label: string, data: FuelPoint[] }[],
  make: keyof Omit<FuelPoint, 'x'>,
  range: [DateTime, DateTime],
) {
  return group.map(country => data.find(country2 => country2.label === country)?.data)
  .filter(s => s)
  .map(s => s!)
  .map(s => {
    const rangeIndex = s.findIndex(p => p.x.diff(range[0]).milliseconds > 0)

    return s
    .slice(rangeIndex)
    .map(d => ({ x: d.x, y: d[make]! }))
  })
}

function mapSeriesCut(series: { x: DateTime, y: number }[][]) {
  if (series.length < 1) {
    return []
  }

  const minDate = DateTime.fromMillis(Math.max(...series.map(s => s.at(0)!.x.toMillis())))
  const maxDate = DateTime.fromMillis(Math.min(...series.map(s => s.at(-1)!.x.toMillis())))
  const steps = Math.ceil(maxDate.diff(minDate, 'months').months)

  const output = series.map((data) => {
    const minIndex = data.findIndex(d => d.x.equals(minDate))
    // const maxIndex = data.findIndex(d => d.x.equals(maxDate))
    return data.slice(minIndex, minIndex + steps + 1)
  })
  .reduce((agg, s) => agg.map((d, i) => ({ x: d.x, y: d.y + s[i].y })))

  return output
}

function fetchData(countryId: string) {
  const call = fetch(`fuel/fuel-${countryId}.json`)

  return call
  .then(res => res.json())
  .then(data => ({
    label: countryId,
    data: data.map((d: any) => ({
      ...d,
      x: DateTime.fromISO(d.x)
    })) as FuelPoint[]
  }))
}

import { DateTime } from 'luxon'
import { useQueries } from '@tanstack/react-query'
import Chart, { rgba, Series } from './Chart'
import { MergeSelect, Point } from './MultiMergeSelect'
import { smooth as smoothSeries } from './series'
import { Make, Segment } from './input'

function Fleet(props: {
  make: Make
  normal: Make|null
  segment: Segment
  smooth: number
  selected: MergeSelect[]
  range: [DateTime, DateTime]
  stacked: boolean
}) {
  const { segment, smooth, selected, make, normal, range, stacked } = props

  const fleet = true
  const projection = true

  const smoothAdjusted = segment === 'cars' ? smooth : Math.max(1, smooth / 3)

  const queries = useQueries({
    queries: selected
      .map(group => group.series)
      .flat()
      .filter((country, index, array) => array.indexOf(country) === index)
      .map(country => ({
      queryKey: ['salesCountry', country, segment, fleet, projection],
      queryFn: () => fetchData(country, segment, fleet, projection),
    staleTime: Infinity,
    }))
  })

  // const queriesSales = useQueries({
  //   queries: selected
  //     .map(group => group.series)
  //     .flat()
  //     .filter((country, index, array) => array.indexOf(country) === index)
  //     .map(country => ({
  //     queryKey: ['salesCountry', country, segment, false, false],
  //     queryFn: () => fetchData(country, segment, false, false),
  //   staleTime: Infinity,
  //   }))
  // })

  const data = queries
    .map(query => query.data!)
    .filter(v => v)

  const dataset: Series[] = selected.map((group, index) => {
    const series = mapOutField(group.series, data, make, range)
    const seriesNormal = mapOutField(group.series, data, 'total', range)

    const seriesMergeSmooth = smoothSeries(mapSeriesCut(series), fleet ? 1 : smoothAdjusted)
    const seriesNormalMergeSmooth = smoothSeries(mapSeriesCut(seriesNormal), fleet ? 1 : smoothAdjusted)

    const name = group.name ?? group.series.join()
    const color = rgba(index)
    const backgroundColor = rgba(index, 0.2)

    return [
      {
        label: name + ' Fleet',
        type: 'raw' as const,
        color,
        backgroundColor,
        data: seriesMergeSmooth,
      },
      {
        label: name + '%',
        type: 'percent' as const,
        color,
        backgroundColor,
        data: seriesMergeSmooth.map((d, i) => ({ x: d.x, y: 100 * d.y / seriesNormalMergeSmooth[i].y })),
      },
    ].filter(v => v).map(v => v!)
  })
  .flat()

  return (
    <Chart
      series={dataset}
      stacked={stacked}
      fitType={'linear'}
      sCurveParams={null}
    />
  )
}

export default Fleet

function mapOutField(
  group: string[],
  data: { label: string, data: Point[] }[],
  make: keyof Omit<Point, 'x'>,
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

function fetchData(country: string, segment: string, fleet: boolean, projection: boolean) {
  const call = fleet ? fetch(`projections/fleet/${segment}-${country}.json`)
  : projection ? fetch(`projections/sales/${segment}-${country}.json`)
  : fetch(`sales/${segment}-${country}.json`)

  return call
  .then(res => res.json())
  .then(data => ({
    label: country,
    data: data.map((d: any) => ({
      ...d,
      x: DateTime.fromISO(d.x)
    })) as Point[]
  }))
}

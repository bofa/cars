import { DateTime } from 'luxon'
import { useState } from 'react'
import { useQueries } from '@tanstack/react-query'
import { HTMLSelect, Switch } from '@blueprintjs/core'
import Chart, { rgba, Series } from './Chart'
import { MergeSelect, MultiMergeSelect, Point } from './MultiMergeSelect'
import { smooth as smoothSeries } from './series'
import { DateRangeSlider } from './DateRangeSlider'

const makes = [
  'bev',
  'phev',
  'hybrid',
  'other',
  'petrol',
  'disel',
  'total',
  // 'projection',
] as const

const segments = [
  'cars',
  'van',
  'busses',
  'mediumtrucks',
  'heavytrucks',
] as const

function App() {
  const [smooth, setSmooth] = useState(12)
  const [make, setMake] = useState<keyof Omit<Point, 'x'>>('bev')
  const [segment, setSegment] = useState<typeof segments[number]>('cars')
  const [projection, setProjection] = useState(false)
  const [fleet, setCumulative] = useState(false)
  const [normal, setNormal] = useState<keyof Omit<Point, 'x'> | null>('total')
  const [selected, setSelected] = useState<MergeSelect[]>([
    {
      name: null,
      series: ['Sweden']
    }
  ])
  const [stacked, setStacked] = useState(false)
  const [range, setRange] = useState<[DateTime, DateTime]>([
    DateTime.now().minus({ year: 5 }).set({ day: 0 }),
    DateTime.now(),
  ])

  const smoothAdjusted = segment === 'cars' ? smooth : Math.max(1, smooth / 3)

  const queries = useQueries({
    queries: selected
      .map(group => group.series)
      .flat()
      .filter((country, index, array) => array.indexOf(country) === index)
      .map(country => ({
      queryKey: ['salesCountry', country, segment, fleet, projection],
      queryFn: () => {

        const call = fleet ? fetch(`projections/fleet/${country}.json`)
          : projection ? fetch(`projections/sales/${country}.json`)
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
    },
    staleTime: Infinity,
    }))
  })

  const data = queries
    .map(query => query.data!)
    .filter(v => v)

  const dataset: Series[] = selected.map((group, index) => {
    const series = mapOutField(group.series, data, make, range)
    const seriesNormal = normal == null
      ? null
      : mapOutField(group.series, data, normal, range)

    console.log('series', series)
    const seriesMergeSmooth = smoothSeries(mapSeriesCut(series), fleet ? 1 : smoothAdjusted)
    const seriesNormalMergeSmooth = seriesNormal == null
    ? null
    : smoothSeries(mapSeriesCut(seriesNormal), fleet ? 1 : smoothAdjusted)

    const name = group.name ?? group.series.join()
    const color = rgba(index)
    const backgroundColor = rgba(index, 0.2)

    return [
      {
        label: name,
        type: 'raw' as const,
        color,
        backgroundColor,
        data: seriesMergeSmooth,
      },
      seriesNormalMergeSmooth === null || stacked ? null : {
        label: name + '%',
        type: 'percent' as const,
        color,
        backgroundColor,
        data: seriesMergeSmooth.map((d, i) => ({ x: d.x, y: 100 * d.y / seriesNormalMergeSmooth[i].y })),
      }
    ].filter(v => v).map(v => v!)
  })
  .flat()

  return (
    <div style={{ width: '100wv', height: '100vh', padding: 20, paddingBottom: 60 }}>
      <div style={{ display: 'flex', gap: 10, alignItems: 'baseline' }}>
        <HTMLSelect value={'' + smooth} onChange={e => setSmooth(+e.target.value)}>
          <option value="1">Month</option>
          <option value="3">Quarter</option>
          <option value="12">Year</option>
        </HTMLSelect>
        <HTMLSelect value={segment} onChange={e => setSegment(e.target.value as any)}>
          {segments.map(make => <option key={make} value={make}>{make}</option>)}
        </HTMLSelect>
        <HTMLSelect value={make} onChange={e => setMake(e.target.value as any)}>
          {makes.map(make => <option key={make} value={make}>{make}</option>)}
        </HTMLSelect>
        <HTMLSelect value={normal ?? 'off'} onChange={e => setNormal(e.target.value === 'off' ? null : e.target.value as any)}>
          {makes.map(normal => <option key={normal} value={normal}>{normal}</option>)}
          <option value="off">-</option>
        </HTMLSelect>
        <Switch
          label="Stacked"
          checked={stacked}
          onChange={e => setStacked(e.target.checked)}
        />
        <Switch
          label="Projection"
          checked={projection}
          onChange={e => setProjection(e.target.checked)}
        />
        <Switch
          label="Fleet"
          checked={fleet}
          onChange={e => setCumulative(e.target.checked)}
        />
      </div>
      <div style={{ width: '100%', height: '100%', display: 'flex' }}>
        <div style={{ flexGrow: 1, flexShrink: 1, width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Chart
            series={dataset}
            stacked={stacked}
            fitType={'linear'}
            sCurveParams={null}
            smooth={smoothAdjusted}
          />
          <DateRangeSlider
            smooth={smoothAdjusted}
            value={range[0]}
            onValue={value => setRange([value, range[1]])}
          />
        </div>
        <MultiMergeSelect
          type={make}
          selected={selected}
          setSelected={setSelected}
        />
      </div>
    </div>
  )
}

export default App

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

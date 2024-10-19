import { DateTime } from 'luxon'
import { useState } from 'react'
import { useQueries } from '@tanstack/react-query'
import { HTMLSelect } from '@blueprintjs/core'
import Chart, { rgba, Series } from './Chart'
import { MergeSelect, MultiMergeSelect } from './MultiMergeSelect'
import { smooth as smoothSeries } from './series'

type Point = {
  x: DateTime
  total: number
  bev: number|null
  phev: number|null
  hybrid: number|null
  other: number|null
  petrol: number|null
  disel: number|null
}

const makes = [
  'bev',
  'phev',
  'hybrid',
  'other',
  'petrol',
  'disel',
  'total',
]

function App() {
  const [smooth, setSmooth] = useState(12)
  const [make, setMake] = useState<keyof Omit<Point, 'x'>>('bev')
  const [normal, setNormal] = useState<keyof Omit<Point, 'x'> | null>('total')
  const [selected, setSelected] = useState<MergeSelect[]>([])

  const queries = useQueries({
    queries: selected
      .map(group => group.series)
      .flat()
      .filter((country, index, array) => array.indexOf(country) === index)
      .map(country => ({
      queryKey: ['salesCountry', country],
      queryFn: () =>
        fetch(`sales-${country}.json`)
        .then(res => res.json())
        .then(data => ({
          label: country,
          data: data.map((d: any) => ({
            ...d,
            x: DateTime.fromISO(d.x)
          })) as Point[]
      })),
      staleTime: Infinity,
    }))
  })

  const data = queries
    .map(query => query.data!)
    .filter(v => v)

  const dataset: Series[] = selected.map((group, index) => {
    const series = mapOutField(group.series, data, make)
    const seriesNormal = normal == null
      ? null
      : mapOutField(group.series, data, normal)

    console.log('series', series)
    const seriesMergeSmooth = smoothSeries(mapSeriesCut(series), smooth)
    const seriesNormalMergeSmooth = seriesNormal == null
    ? null
    : smoothSeries(mapSeriesCut(seriesNormal), smooth)

    const name = group.name ?? group.series.join()
    const color = rgba(index)

    return [
      {
        label: name,
        type: 'raw' as const,
        color,
        data: seriesMergeSmooth,
      },
      seriesNormalMergeSmooth === null ? null : {
        label: name + '%',
        type: 'percent' as const,
        color,
        data: seriesMergeSmooth.map((d, i) => ({ x: d.x, y: 100 * d.y / seriesNormalMergeSmooth[i].y })),
      }
    ].filter(v => v).map(v => v!)
  })
  .flat()

  // console.log('dataset', dataset)

  return (
    <div style={{ width: '100wv', height: '100vh', padding: 20, paddingBottom: 60 }}>
      <div style={{ display: 'flex', gap: 10 }}>
        <HTMLSelect value={'' + smooth} onChange={e => setSmooth(+e.target.value)}>
          <option value="1">Month</option>
          <option value="3">Quarter</option>
          <option value="12">Year</option>
        </HTMLSelect>
        <HTMLSelect value={make} onChange={e => setMake(e.target.value as any)}>
          {makes.map(make => <option key={make} value={make}>{make}</option>)}
        </HTMLSelect>
        <HTMLSelect value={normal ?? 'off'} onChange={e => setNormal(e.target.value === 'off' ? null : e.target.value as any)}>
          {makes.map(normal => <option key={normal} value={normal}>{normal}</option>)}
          <option value="off">-</option>
        </HTMLSelect>
      </div>
      <div style={{ width: '100%', height: '100%', display: 'flex' }}>
        <Chart series={dataset} fitType={'linear'} sCurveParams={null} smooth={smooth}/>
        <MultiMergeSelect
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
  make: keyof Omit<Point, 'x'>
) {
  return group.map(country => data.find(country2 => country2.label === country)?.data)
  .filter(s => s)
  .map(s => s!)
  .map(s => s.map(d => ({ x: d.x, y: d[make]! })))
}

function mapSeriesCut(series: { x: DateTime, y: number }[][]) {
  if (series.length < 1) {
    return []
  }

  const minDate = DateTime.fromMillis(Math.max(...series.map(s => s.at(0)!.x.toMillis())))
  const maxDate = DateTime.fromMillis(Math.min(...series.map(s => s.at(-1)!.x.toMillis())))
  const steps = maxDate.diff(minDate, 'months').months

  return series.map((data) => {
    const minIndex = data.findIndex(d => d.x.equals(minDate))
    // const maxIndex = data.findIndex(d => d.x.equals(maxDate))
    return data.slice(minIndex, minIndex + steps + 1)
  })
  .reduce((agg, s) => agg.map((d, i) => ({ x: d.x, y: d.y + s[i].y })))
}

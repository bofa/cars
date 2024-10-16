import { DateTime } from 'luxon'
import { useState } from 'react'
import { useQueries } from '@tanstack/react-query'
import { HTMLSelect } from '@blueprintjs/core'
import Chart, { Series } from './Chart'
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

const countries = [
  "Austria", 
  "Belgium", 
  "Bulgaria", 
  "Croatia", 
  "Cyprus", 
  "Czechia", 
  "Denmark", 
  "Estonia", 
  "Finland", 
  "France", 
  "Germany", 
  "Greece", 
  "Hungary", 
  "Ireland", 
  "Italy", 
  "Latvia", 
  "Lithuania", 
  "Luxembourg",
  "Malta", 
  "Netherlands", 
  "Poland", 
  "Portugal", 
  "Romania", 
  "Slovenia", 
  "Spain", 
  "Sweden",
  "Iceland",
  "Norway",
  "Switzerland",
  "United Kingdom",
  "United States",
] as const

function App() {
  const [smooth, setSmooth] = useState(12)
  const [make, setMake] = useState<keyof Omit<Point, 'x'>>('bev')
  const [normal, setNormal] = useState<keyof Omit<Point, 'x'>>('total')
  const [selected, setSelected] = useState<MergeSelect[]>([])

  const queries = useQueries({
    queries: selected.map(group => group.series[0]).map(country => ({
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

  // const datas = queries.map(query => query.data?.filter(d => d[make] && d[normal])!)
  //   .filter(d => d)

  const dataset: Series[] = queries.map(query => query.data).filter(d => d).map(d => d!).map((country, index) => {
    const series = country.data.map(d => ({ x: d.x!, y: d[make]! }))
    const seriesNormal = country.data.map(d => ({ x: d.x!, y: d[normal]! }))
    const seriesSmooth = smoothSeries(series, smooth)
    const seriesNormalSmooth = smoothSeries(seriesNormal, smooth)
    
    return [
      {
        label: country.label,
        type: 'raw' as const,
        data: seriesSmooth,
      },
      {
        label: country.label + '%',
        type: 'percent' as const,
        data: seriesSmooth.map((d, i) => ({ x: d.x, y: Math.round(1000 * d.y / seriesNormalSmooth[i].y) / 10 })),
      }
    ]
  })
  .flat()

  // console.log('dataset', dataset)

  return (
    <>
      <div style={{ display: 'flex', gap: 10 }}>
        <HTMLSelect value={'' + smooth} onChange={e => setSmooth(+e.target.value)}>
          <option value="1">Month</option>
          <option value="3">Quarter</option>
          <option value="12">Year</option>
        </HTMLSelect>
        <HTMLSelect value={make} onChange={e => setMake(e.target.value as any)}>
          {makes.map(make => <option key={make} value={make}>{make}</option>)}
        </HTMLSelect>
        <HTMLSelect value={normal} onChange={e => setNormal(e.target.value as any)}>
          {makes.map(normal => <option key={normal} value={normal}>{normal}</option>)}
        </HTMLSelect>
      </div>
      <div style={{ width: '80vw', display: 'flex' }}>
        <Chart series={dataset} fitType={'linear'} sCurveParams={null} smooth={smooth}/>
        <MultiMergeSelect
          items={countries.map(c => ({ id: c, name: c }))}
          selected={selected}
          setSelected={setSelected}
        />
      </div>
    </>
  )
}

export default App

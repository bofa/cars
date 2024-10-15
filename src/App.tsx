import { DateTime } from 'luxon'
import { useState } from 'react'
import { useQueries, useQuery } from '@tanstack/react-query'
import { HTMLSelect } from '@blueprintjs/core'
import Chart from './Chart'
import { MergeSelect, MultiMergeSelect } from './MultiMergeSelect'
import './App.css'

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

  const dataset = queries.map(query => query.data).filter(d => d).map(d => d!).map((country, index) => ({
    label: country.label,
    data: country.data.map(d => ({ x: d.x!, y: d[make]! }))
      .filter(d => d.y)
      ?? [],
  }))

  console.log('dataset', dataset)

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
      <div style={{ display: 'flex' }}>
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

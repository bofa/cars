import { DateTime } from 'luxon'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import './App.css'
import Chart from './Chart'
import { HTMLSelect } from '@blueprintjs/core'

type Point = {
  x: string
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

const counstries = [
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
] as const

function App() {
  const [country, setCountry] = useState("Sweden")
  const [smooth, setSmooth] = useState(12)
  const [make, setMake] = useState<keyof Omit<Point, 'x'>>('bev')
  const [normal, setNormal] = useState<keyof Omit<Point, 'x'>>('total')

  const query = useQuery({
    queryKey: ['salesCountry', country],
    queryFn: () =>
      fetch(`sales-${country}.json`).then((res) =>
        res.json() as Promise<Point[]>,
      ),
    staleTime: Infinity,
  })

  const data = query.data?.filter(d => d[make] && d[normal])
    ?? []

  console.log('asdf', data)

  const dataset = [{
    label: country,
    data: data?.map(d => ({ x: DateTime.fromISO(d.x), y: d[make]! }))
      .filter(d => d.y)
      ?? [],
  }]

  const normalize = data?.map(d => ({ x: DateTime.fromISO(d.x), y: d[normal]! }))

  return (
    <>
      <div style={{ display: 'flex', gap: 10 }}>
        <HTMLSelect value={country} onChange={e => setCountry(e.target.value)}>
          {counstries.map(country => <option key={country} value={country}>{country}</option>)}
        </HTMLSelect>
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
      <div>
        <Chart series={dataset} normalize={normalize} fitType={'linear'} sCurveParams={null} smooth={smooth}/>
      </div>
    </>
  )
}

export default App

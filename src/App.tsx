import { DateTime } from 'luxon'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import './App.css'
import Chart from './Chart'
import { HTMLSelect } from '@blueprintjs/core'

type Point = {
  x: string
  bev: number
  phev: number
  hybrid: number
  other: number
  petrol: number
  disel: number
  total: number
}

const makes = [
  'bev',
  'phev',
  'hybrid',
  'other',
  'petrol',
  'disel',
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

  const { data } = useQuery({
    queryKey: ['salesCountry', country],
    queryFn: () =>
      fetch(`sales-${country}.json`).then((res) =>
        res.json() as Promise<Point[]>,
      ),
    staleTime: Infinity,
  })

  console.log('asdf', data)

  const dataset = [{
    label: country,
    data: data?.map(d => ({ x: DateTime.fromISO(d.x), y: d[make] })) ?? [],
  }]

  const normalize = data?.map(d => ({ x: DateTime.fromISO(d.x), y: d.total }))

  return (
    <>
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
      <div>
        <Chart series={dataset} normalize={normalize} fitType={'linear'} sCurveParams={null} smooth={smooth}/>
      </div>
    </>
  )
}

export default App

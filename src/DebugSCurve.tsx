import { DateTime } from "luxon"
import { mean } from "mathjs"
import { useState } from "react"
import { Button, Card, FormGroup, InputGroup, NumericInput } from "@blueprintjs/core"
import scurveFit, { model } from "./s-curve-regression"
// import { basicProjection } from './simulator'
import Chart, { Series } from "./Chart"

// import dataset from "../public/sales/cars-Netherlands.json"
// import dataset from "../public/sales/cars-Sweden.json"
// import dataset from "../public/sales/cars-Germany.json"
// import dataset from "../public/sales/cars-Hungary.json"
import dataset from "../public/sales/cars-Bulgaria.json"

const now = DateTime.now()
const startDate = DateTime.fromISO(dataset[0].x, { zone: 'utc' })
// const curve = Array(100).fill(0).map((_, i) => i)
const curve = dataset.map(p => p.bev)
const total = dataset.map(p => p.total)
const average = mean(total)

export function DebugSCurve() {
  // const [internalCurve, setInternalCurve] = useState<number[]>([])
  const [curveParams, setCurveParams] = useState({
    a: average,
    b: 1000,
    c: 0.05,
    // func: ((x: number) => 0) as any,
  })

  const iterate = () => {
    // console.log('curveParams', curveParams)

    const fitted = scurveFit(
      curve,
      curveParams.a,
      curveParams.b,
      curveParams.c,
      100000
    )

    setCurveParams(fitted)

    // const u0 = [curve, total]
    // const uFunc = basicProjection(u0, startDate, 12*20, 2000000)
    // const gurkburk = Array(140).fill(0)
    //   .map((v, i) => uFunc(i))
    //   .map(matrix => matrix.get([1, 0]) as number)
    // setInternalCurve(gurkburk)
  }

  const series: Series[] = [
    {
      label: 'series',
      type: 'raw',
      color: 'blue',
      backgroundColor: 'blue',
      data: curve.map((y, i) => ({ x: now.plus({ month: i }), y }))
    },
    {
      label: 'fit',
      type: 'raw',
      color: 'red',
      backgroundColor: 'red',
      // data: internalCurve.map((y, i) => ({ x: now.plus({ month: i }), y }))
      data: model(curve.map((v, i) => i), curveParams.a, curveParams.b, curveParams.c)
        .map((y, i) => ({ x: now.plus({ month: i }), y }))
    }
  ]

  return (
    <div style={{ margin: 20 }}>
      <Card style={{ width: 400 }}>
        <FormGroup>
          <Button onClick={iterate}>Iterate</Button>
        </FormGroup>
        {/* <FormGroup>
          <NumericInput
            value={curveParams.a}
            onValueChange={(nr, str) => setCurveParams((param) => ({ ...param, a: nr }))}
          />
        <FormGroup>
        </FormGroup>
          <NumericInput
            value={curveParams.b}
            onValueChange={(nr, str) => setCurveParams((param) => ({ ...param, b: nr }))}
          />
        <FormGroup>
        </FormGroup>
          <NumericInput
            value={curveParams.c}
            onValueChange={(nr, str) => setCurveParams((param) => ({ ...param, c: nr }))}
          />
        </FormGroup> */}
      </Card>
      <div style={{ height: 600 }}>
        <Chart series={series} fitType="linear" sCurveParams={null} smooth={0} stacked={false}/>
      </div>
    </div>
  )
}

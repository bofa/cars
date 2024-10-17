// tslint:disable: jsx-wrap-multiline

import { DateTime } from 'luxon'
// import { Line } from 'react-chartjs-2'
// import 'chartjs-plugin-annotation'
import { Line } from 'react-chartjs-2'
import { ChartOptions } from 'chart.js'
import { exponentialFit, linearFit } from './regression'
import { model } from './s-curve-regression'

export type FitType = keyof typeof regression
const regression = {
  linear: linearFit,
  exponential: exponentialFit,
  scurve: () => console.log('Not implmented')
}

export type Series = {
  type: 'raw'|'percent'
  color: string
  label: string 
  data: { x: DateTime, y: number }[]
}

type ChartProps = {
  series: Series[]
  fitType: FitType
  fitItem?: string | null
  sCurveParams: null | { a: number, b: number, c: number }
  // normalize?: { x: DateTime; y: number; }[]
  smooth: number
}

export default function (props: ChartProps) {
  // const { analyses, chartItems } = props;
  // const { normalize } = props;

  const options: ChartOptions<'line'> = {
    // responsive: true,
    maintainAspectRatio: false,
    animation: false,
    scales: {
      x: {
        type: 'time'
      },
      y: {
        position: 'right',
        // id: 'mainY',
        min: 0,
        ticks: {
          // min: 0,
        }
      },
      y2: {
        position: 'left',
        min: 0,
        max: 100,
        // id: 'mainY',
        ticks: {
          // min: 0,
        }
      },
      //   ...normalize
      //   // ...props.normalize.length > 0
      //     ? [{
      //         id: 'percentY',
      //         position: 'right',
      //         ticks: {
      //           suggestedMin: 0,
      //           suggestedMax: 100,
      //         }
      //       }]
      //     : []
      // ]
    }
  }

  const formattedSeries = {
    datasets: props.series
      .map((s, i) => {
        return [
          {
            yAxisID: s.type !== 'percent' ? 'y' : 'y2',
            fill: false,
            // backgroundColor: rgba(i),
            borderColor: s.color,
            borderDash: s.type !== 'percent' ? undefined : [10, 5],
            label: s.label,
            data: s.data.map(d => ({ ...d, x: d.x.toJSDate(), y: Math.round(d.y) }))
          },
          // ... smoothedNormalize === undefined ? [] : 
          // [{
          //   yAxisID: 'y2',
          //   fill: false,
          //   borderColor: rgbLabel(i, s.label),
          //   label: s.label + '%',
          //   borderDash: [10, 5],
          //   // data: props.normalize,
          //   data: s.data.map((d, index) => ({ ...d, x: d.x.toJSDate(), y: Math.round(1000 * d.y / smoothedNormalize[index].y ) / 10 })),
          // }]
        ];
      })
      .reduce((out, arr) => out.concat(arr), [])
      // .concat(props.fittedSeries.map(s => ({
      //   yAxisID: 'mainY',
      //   fill: false,
      //   // backgroundColor: rgba(i),
      //   borderColor: rgba(18),
      //   label: s.label,
      //   data: smooth(s.data, props.smooth).map(d => ({ ...d, y: Math.round(d.y) }))
      // })))
  };

  // const fitSeries = props.series?.find(s => s.label === props.fitItem)?.data;
  // if (fitSeries) {

  //   let func: any;
  //   const sCurveParams = props.sCurveParams;
  //   if (props.fitType === 'scurve' && sCurveParams !== null) {
  //     func = (x: number) => model([x], sCurveParams.a, sCurveParams.b, sCurveParams.c)[0];
  //   } else if (props.fitType !== 'scurve') {
  //     const output = regression[props.fitType](fitSeries.map(({ y }) => y));
  //     func = output.func;
  //   }

  //   if (func) {
  //     const dataset = {
  //       yAxisID: 'mainY',
  //       fill: false,
  //       // backgroundColor: rgba(i),
  //       borderColor: rgba(18),
  //       label: 'fit-' + props.fitItem,
  //       data: fitSeries
  //           .map(({ x }, i) =>
  //           ({ x: x.toJSDate(), y: func(i) }))
  //     };

  //     formattedSeries.datasets?.push(dataset);
  //   }
  // }

  console.log('formattedSeries', formattedSeries)
  
  return (
    <div style={{ flexGrow: 1, width: '100%', height: '80vh' }}>
      <Line data={formattedSeries} options={options} />
    </div>
  )
}

export function rgba(index: number, alpha: number = 0.6) {
  const o = Math.round, r = (seed: number) => Math.sin(seed * index) ** 2, s = 255;
  return 'rgba(' + o(r(1) * s) + ',' + o(r(2) * s) + ',' + o(r(3) * s) + ',' + alpha + ')';
}

// const hardCodedColors = {
//   'Total-BEV': 'green',
// }

export function rgbLabel(index: number, label: string) {
  if (label.includes('Total-BEV')) {
    return 'limegreen';
  } else if (label.includes('Total-None-Bev')) {
    return 'black';
  }

  return rgba(index);
}


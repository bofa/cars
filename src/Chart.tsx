// tslint:disable: jsx-wrap-multiline

import * as React from 'react';
import { DateTime } from 'luxon';
// import { Line } from 'react-chartjs-2';
import 'chartjs-plugin-annotation';
import { Line } from 'react-chartjs-2';
import { ChartData, ChartOptions } from 'chart.js';
import { exponentialFit, linearFit } from './regression';
import { model } from './s-curve-regression';

export type FitType = keyof typeof regression
const regression = {
  linear: linearFit,
  exponential: exponentialFit,
  scurve: () => console.log('Not implmented')
};

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

export function smooth(list: { x: DateTime, y: number }[], size: number) {
  // if (isNaN(size)) {
  //   const cumulative = list
  //     .map((v1, i1) => ({
  //       t: v1.t,
  //       y: list
  //         .filter((_2, i2) => i2 <= i1 )
  //         .map(({ y }) => y)
  //         .reduce((acc, v) => acc + v)
  //       }));

  //   return cumulative;
  // }

  // TODO Control if it's correct
  const output = list
    .map((v1, i1, a1) => {
      const y = a1
        .filter((v2, i2) => i2 <= i1 && v1.x.diff(v2.x.plus({ days: 3 }), 'months').months <= size - 1)
        .map(({ y }, i, a) => y)

      return {
        x: v1.x,
        y: y.reduce((acc, v) => acc + v, 0)
      }
    })
    .slice(size - 1);

  return output;
}

export interface Series {
  label: string;
  data: { x: DateTime, y: number }[];
}

interface ChartProps {
  series: Series[];
  fitType: FitType;
  fitItem: string | null | undefined;
  sCurveParams: null | { a: number, b: number, c: number };
  normalize?: { x: DateTime; y: number; }[];
  smooth: number;
}

export default function Chart(props: ChartProps) {
  // const { analyses, chartItems } = props;
  const { normalize } = props;

  const options: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      xAxes: [{
        type: 'time'
      }],
      yAxes: [
        {
          id: 'mainY',
          ticks: {
            min: 0,
          }
        },
        ...normalize
        // ...props.normalize.length > 0
          ? [{
              id: 'percentY',
              position: 'right',
              ticks: {
                suggestedMin: 0,
                suggestedMax: 100,
              }
            }]
          : []
      ]
    }
  };

  // const normalizedSmoothed = props.normalize.length > 0 ? smooth(props.normalize, props.smooth) : null;
  // const smoothedSeries = props.series.map(s => ({
  //   label: s.label,
  //   data: smooth(s.data, props.smooth),
  // }));

  const formattedSeries = {
    datasets: props.series
      .map((s, i) => {
        return [
          {
            yAxisID: 'mainY',
            fill: false,
            // backgroundColor: rgba(i),
            borderColor: rgbLabel(i, s.label),
            label: s.label,
            data: s.data.map(d => ({ ...d, x: d.x.toJSDate(), y: Math.round(d.y) }))
          },
          ... normalize === undefined ? [] : 
          [{
            yAxisID: 'percentY',
            fill: false,
            borderColor: rgbLabel(i, s.label),
            label: s.label + '%',
            borderDash: [10, 5],
            // data: props.normalize,
            data: s.data.map((d, index) => ({ ...d, x: d.x.toJSDate(), y: Math.round(1000 * d.y / normalize[index].y ) / 10 })),
          }]
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

  const fitSeries = props.series?.find(s => s.label === props.fitItem)?.data;
  if (fitSeries) {

    let func: any;
    const sCurveParams = props.sCurveParams;
    if (props.fitType === 'scurve' && sCurveParams !== null) {
      func = (x: number) => model([x], sCurveParams.a, sCurveParams.b, sCurveParams.c)[0];
    } else if (props.fitType !== 'scurve') {
      const output = regression[props.fitType](fitSeries.map(({ y }) => y));
      func = output.func;
    }

    if (func) {
      const dataset = {
        yAxisID: 'mainY',
        fill: false,
        // backgroundColor: rgba(i),
        borderColor: rgba(18),
        label: 'fit-' + props.fitItem,
        data: fitSeries
            .map(({ x }, i) =>
            ({ x: x.toJSDate(), y: func(i) }))
      };

      formattedSeries.datasets?.push(dataset);
    }
  }
  
  return <Line data={formattedSeries} options={options} />;
}
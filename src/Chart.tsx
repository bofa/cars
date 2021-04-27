// tslint:disable: jsx-wrap-multiline

import * as React from 'react';
import * as moment from 'moment';
// import { Line } from 'react-chartjs-2';
import 'chartjs-plugin-annotation';
import { Line } from 'react-chartjs-2';
import { ChartData, ChartOptions } from 'chart.js';
import { exponentialFit, linearFit } from './regression';
import { model } from './s-curve-regression';

const regression = {
  linear: linearFit,
  exponential: exponentialFit,
};

export function rgba(index: number, alpha: number = 0.6) {
  const o = Math.round, r = (seed: number) => Math.sin(seed * index) ** 2, s = 255;
  return 'rgba(' + o(r(1) * s) + ',' + o(r(2) * s) + ',' + o(r(3) * s) + ',' + alpha + ')';
}

export function smooth(list: { t: moment.Moment, y: number }[], size: number) {
  if (isNaN(size)) {
    const cumulative = list
      .map((v1, i1) => ({
        t: v1.t,
        y: list
          .filter((_2, i2) => i2 <= i1 )
          .map(({ y }) => y)
          .reduce((acc, v) => acc + v)
        }));

    return cumulative;
  }

  const output = list
    .map(d => ({
      y: d.y,
      t: d.t,
      ms: moment(d.t).valueOf(),
      msLow: moment(d.t).subtract(size - 1, 'months').subtract(3, 'days').valueOf(),
    }))
    .map((v1, i1, a1) => ({
      t: v1.t,
      y: a1
        .filter((v2) => v2.ms >= v1.msLow && v2.ms <= v1.ms)
        .map(({ y }, i, a) => y)
        .reduce((acc, v) => acc + v)
      })
    )
    .slice(size);

  return output;
}

export interface Series {
  label: string;
  data: { t: moment.Moment, y: number }[];
}

interface ChartProps {
  series: Series[];
  fitType: string;
  fitItem: string | null | undefined;
  sCurveParams: null | { a: number, b: number, c: number };
  normalize?: { t: moment.Moment; y: number; }[];
  smooth: number;
}

export default function Chart(props: ChartProps) {
  // const { analyses, chartItems } = props;

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
        ... props.normalize
          ? {
            id: 'percentY',
            position: 'right',
          }
          : []
      ]
    }
  };

  const normalizedSmoothed = props.normalize !== undefined ? smooth(props.normalize, props.smooth) : null;

  const formattedSeries: ChartData = {
    datasets: props.series
      .map((s, i) => {
        const smoothed = smooth(s.data, props.smooth);

        return [
          {
            yAxisID: 'mainY',
            fill: false,
            // backgroundColor: rgba(i),
            borderColor: rgba(i),
            label: s.label,
            data: smoothed.map(d => ({ ...d, y: Math.round(d.y) }))
          },
          ... normalizedSmoothed === null ? [] : 
          [{
            yAxisID: 'percentY',
            fill: false,
            borderColor: rgba(i),
            label: s.label + '%',
            borderDash: [10, 5],
            // data: props.normalize,
            data: smoothed.map((d, index) => ({ ...d, y: Math.round(1000 * d.y / normalizedSmoothed[index].y ) / 10 })),
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

  const fitSeries = props.series.find(s => s.label === props.fitItem)?.data;
  if (fitSeries) {

    let func: any;
    const sCurveParams = props.sCurveParams;
    if (props.fitType === 'scurve' && sCurveParams !== null) {
      func = (x: number) => model([x], sCurveParams.a, sCurveParams.b, sCurveParams.c)[0];
      console.log('a b c', sCurveParams.a, sCurveParams.b, sCurveParams.c);
    } else if (props.fitType !== 'scurve') {
      // const fit = exponentialFit(smooth(fitSeries, props.smooth).map(({ y }) => y));
      const output = regression[props.fitType](smooth(fitSeries, props.smooth).map(({ y }) => y));
      func = output.func;
      console.log(output.params);
    }

    if (func) {
      const dataset = {
        yAxisID: 'mainY',
        fill: false,
        // backgroundColor: rgba(i),
        borderColor: rgba(18),
        label: 'exponential-fit-' + props.fitItem,
        data:
          // new Array(fitSeries.length * 2).fill(0)
          // : fitSeries[0].t.clone().add(i, 'months')
          fitSeries
            .map(({ t }, i) =>
            ({ t, y: func(i) }))
      };

      formattedSeries.datasets?.push(dataset);
    }
  }
  
  // console.log('props', formattedSeries);
  // debug
  // scurveFit([]);

  return <Line data={formattedSeries} options={options} />;
}
// tslint:disable: jsx-wrap-multiline

import * as React from 'react';
import * as moment from 'moment';
// import { Line } from 'react-chartjs-2';
import 'chartjs-plugin-annotation';
import { Line } from 'react-chartjs-2';
import { ChartData, ChartOptions } from 'chart.js';

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
      msLow: moment(d.t).subtract(size - 1, 'months').valueOf(),
    }))
    .map((v1, i1, a1) => ({
      t: v1.t,
      y: a1
        .filter((v2) => v2.ms >= v1.msLow && v2.ms <= v1.ms)
        .map(({ y }, i, a) => y)
        .reduce((acc, v) => acc + v)
      }));

  return output;
}

export interface Series {
  label: string;
  data: { t: moment.Moment, y: number }[];
}

interface ChartProps {
  series: Series[];
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
      yAxes: [{
        ticks: {
          min: 0,
        }
      }]
    }
  };

  const formattedSeries: ChartData = {
    datasets: props.series
      .map((s, i) => ({
        fill: false,
        // backgroundColor: rgba(i),
        borderColor: rgba(i),
        label: s.label,
        data: smooth(s.data, props.smooth)
      }))
  };

  console.log('props', formattedSeries);

  return <Line data={formattedSeries} options={options} />;
}
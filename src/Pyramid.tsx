// tslint:disable: jsx-wrap-multiline

import * as React from 'react';
import * as moment from 'moment';
// import { Line } from 'react-chartjs-2';
import 'chartjs-plugin-annotation';
import { HorizontalBar } from 'react-chartjs-2';
import { Series } from './Chart';
// import { ChartData, ChartOptions } from 'chart.js';

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
    .slice(size - 1);

  return output;
}

interface ChartProps {
  series: Series[];
}

export default function Chart(props: ChartProps) {
  if (props.series.length < 2) {
    return null;
  }

  const series12 = props.series
    .map(s => ({
      label: s.label,
      data: smooth(s.data, 12).filter((d, i) => (i % 12) === 0),
    }))

  console.log('series12', series12);
  
  const options = {
    // indexAxis: 'y',
    // Elements options apply to all of the options unless overridden in a dataset
    // In this case, we are setting the border of each horizontal bar to be 2px wide
    // elements: {
    //   bar: {
    //     borderWidth: 2,
    //   }
    // },
    scales: {
      xAxes: [{
        ticks: {
          beginAtZero: true,
          callback: Math.abs
        }
      }],
      yAxes: [{
        stacked: true,
      }],
    },
    // stacked: true,
    // responsive: true,
    // plugins: {
    //   legend: {
    //     position: 'right',
    //   },
    //   title: {
    //     display: true,
    //     text: 'Chart.js Horizontal Bar Chart'
    //   }
    // }
  };

  const data = {
    labels: series12[0].data.map((v, i, a) => a.length - i - 1),
    datasets: [
      {
        label: 'None BEV',
        data: series12[1].data.map(d => -d.y),
        borderColor: 'red',
        backgroundColor: 'red',
      },
      {
        label: 'BEV',
        data: series12[0].data.map(d => d.y),
        borderColor: 'green',
        backgroundColor: 'green',
      },
    ]
  };

  return <HorizontalBar data={data} options={options} />;
}
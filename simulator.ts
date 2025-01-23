import { DateTime } from 'luxon'
import { matrix, zeros, ones, multiply, add, Matrix, sum, concat, mean } from 'mathjs'
// import { Series } from './Chart';

type Series = {
  label: string
  data: { x: DateTime, y: number }[]
}

const N = 12 * 35

const decay = (n: number) => Math.max(0, Math.min(1, 1 - 0.990*Math.exp(0.020*(n - 450))))
const recursiveDecay: (n: number) => number = (n: number) => n === 0 ? 1 : decay(n)*recursiveDecay(n-1)

const A = matrix(zeros(2*N, 2*N))
for(let n = 0; n < N - 1; n += 1) {
  const d = decay(n);
  A.set([n+1, n], d)
  A.set([N + n+1, N + n], d)
}

const B = matrix(zeros(2*N, 2))
B.set([0, 0], 1)
B.set([N, 1], 1)

// console.log('A', A, 'B', B)

export function projection(x0: Matrix, u: (n: number) => Matrix, interations: number) {
  let x = x0.clone()
  
  const X = Array(interations)
  for (let n = 0; n < interations; n += 1) {
    // console.log('u', u(n).toString())
    x = add(multiply(A, x), multiply(B, u(n)))
    X[n] = x
  }
  
  return X
}

function interpolate(n: number, scale: number) {
  return Math.max(0, Math.min(1, n/scale))
}

const sale = (n: number, baseSales: number, slope: number, baseEV: number) =>
  Math.min(0.8*baseSales, n * Math.max(0, slope) + baseEV)

export function basicProjection(uStart: number[][], startDate: DateTime, T = 12*20) {
  const baseSales = mean(uStart[0].map((_, i) => uStart[0][i] + uStart[1][i]))
  const baseEV = mean(uStart[0].slice(-6))
  const slope = (uStart[0][uStart[0].length-1] - uStart[0][uStart[0].length-12]) / 12
  // const u = (n: number) => multiply(180000, matrix([[1-interpolate(n-10, 12)], [interpolate(n-10, 12)]]))
  
  // const x0 = matrix(concat(zeros(N, 1), zeros(N, 1), 0))
  const x0 = matrix([...Array(N).fill(0).map((_, i) => [baseSales*recursiveDecay(i)]), ...Array(N).fill(0).map(() => [0])])
  // const x0 = multiply(baseSales, matrix(concat(ones(N, 1), zeros(N, 1), 0)))
  const u: (n: number) => Matrix = n => n < uStart[0].length
    ? matrix([[uStart[1][n]], [uStart[0][n]]])
    : matrix([[baseSales - sale(n - uStart[0].length, baseSales, slope, baseEV)], [sale(n - uStart[0].length, baseSales, slope, baseEV)]])
  // const u: (n: number) => Matrix = n => n === 0 ? matrix([[1000], [0]]) : matrix([[0], [0]])

  // const T = 12*20;
  const run = projection(x0, u, T);

  // console.log('run', run)

  const sumCombustionMatrix = concat(matrix(ones(1, N)), matrix(zeros(1, N)))
  const sumBEVMatrix = concat(matrix(zeros(1, N)), matrix(ones(1, N)))

  const combustionSeries: Series = {
    label: 'Total-None-Bev',
    data:  run.map((x, i) => ({ x: startDate.plus({ months: i }) , y: sum(multiply(sumCombustionMatrix, x)) as number }))
  }

  const bevSeries: Series = {
    label: 'Total-BEV',
    data:  run.map((x, i) => ({ x: startDate.plus({ months: i }), y: sum(multiply(sumBEVMatrix, x)) as number }))
  }

  const baseLine = {
    label: 'baseline',
    data: uStart[0].map((y, i) => ({ x: startDate.plus({ months: i }), y: 12*y }))
  }

  const projectedSales = {
    label: 'projectedSales',
    data: Array(T).fill(0).map((_, i) => ({ x: startDate.plus({ months: i }), y: 12*u(i).get([1, 0])  as number }))
  }

  // const init = Array(N).fill(0)
  //   .map((_, i) => 1000*recursiveDecay(i))

  // const weight = sum(init.map((y, i) => y * i / 12)) / sum(init)

  // const x0Series = {
  //   label: 'x0', 
  //   data: init
  //     .slice(0, 240)
  //     .map((y, i) => ({ t: startDate.clone().add(i, 'months'), y }))
  // }

  // console.log('x0Series', weight, x0Series)

  return {combustionSeries, bevSeries, baseLine, projectedSales}
}

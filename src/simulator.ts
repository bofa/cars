import { matrix, zeros, ones, multiply, add, subset, Matrix, sum, index, concat } from 'mathjs'
import { Series } from './Chart';
import * as moment from 'moment';

const N = 12 * 40

const decay = (n: number) => Math.min(1, 1 - 0.2/12*Math.exp(0.13*n/12 - 3))

const A = matrix(zeros(2*N, 2*N))
for(let n = 0; n < N - 1; n += 1) {
  const d = decay(n);
  A.set([n+1, n], d)
  A.set([N + n+1, N + n], d)
}

const B = matrix(zeros(2*N, 2))
B.set([0, 0], 1)
B.set([N, 1], 1)

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

const baseSales = 25000;
const sales = [0, 2546, 3734, 7079, 15610, 27848, 57469, 96987, 102826]
  .map(v => Array(12).fill(v/12) as number[])
  .reduce((s, a) => s.concat(a))

const sale = (n: number) => n < sales.length
  ? sales[n]
  : Math.min(0.8*baseSales, (n - sales.length + 1) * (102826/12 - 96987/12) + 102826/12)

// const sale = (n: number) => 0

console.log(Array(30).fill(0).map((v, i) => sale(i)))

export function basicProjection() {
  const x0 = multiply(500000/N*12, matrix(concat(ones(N, 1), zeros(N, 1), 0)))

  // const u = (n: number) => multiply(180000, matrix([[1-interpolate(n-10, 12)], [interpolate(n-10, 12)]]))
  const u: (n: number) => Matrix = n => matrix([[baseSales - sale(n)], [sale(n)]])

  const T = 12*30;
  const run = projection(x0, u, T);

  const sumCombustionMatrix = concat(matrix(ones(1, N)), matrix(zeros(1, N)))
  const sumBEVMatrix = concat(matrix(zeros(1, N)), matrix(ones(1, N)))

  const startDate = moment('2015-01-01')
  const combustionSeries: Series = {
    label: 'Total-None-Bev',
    data:  run.map((x, i) => ({ t: startDate.clone().add(i, 'months') , y: sum(multiply(sumCombustionMatrix, x)) }))
  }

  const bevSeries: Series = {
    label: 'Total-BEV',
    data:  run.map((x, i) => ({ t: startDate.clone().add(i, 'months'), y: sum(multiply(sumBEVMatrix, x)) }))
  }

  return [combustionSeries, bevSeries]
}
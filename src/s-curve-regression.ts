const exp = Math.exp;
const e = Math.exp;

export function model(X: number[], a: number, b: number, c: number) {
    const m = X.map(x => a / (1 + b * exp(-c * x)));

    return m;
}

// export function model2(X: number[], a: number, b: number, c: number) {
//     const m = X.map(x => a / (1 + exp(b - c * x)));

//     return m;
// }

export function aDirectionComponent(Y: number[], X: number[], a: number, b: number, c: number) {
    // const da = Y.map((y, i) => -2 * (y - a / (1 + exp(b - c * X[i]))) / (1 + exp(b - c * X[i])))
    //     .reduce((sum, d) => sum + d);
    const da = Y.map((y, i) => 2 * e(c * X[i]) * (a * e(c * X[i]) - y * (b + e(c * X[i]))) / (b + e(c * X[i])) ** 2 )
      .reduce((sum, d) => sum + d);

    return da;
}

export function bDirectionComponent(Y: number[], X: number[], a: number, b: number, c: number) {
    // const db = Y.map((y, i) =>
    //     2 * a * exp(b - c * X[i]) * (y - a / (1 + exp(b - c * X[i]))) / (1 + exp(b - c * X[i])) ** 2)
    //     .reduce((sum, d) => sum + d);
    const db = Y.map((y, i) =>
        2 * a * e(-c * X[i]) * (y - a / (1 + b * e(-c * X[i]))) / (1 + b * exp(-c * X[i])) ** 2
        )
        .reduce((sum, d) => sum + d);

    return db;
}

export function cDirectionComponent(Y: number[], X: number[], a: number, b: number, c: number) {
    // const dc = Y.map((y, i) =>
    //     -2 * a * X[i] * exp(b - c * X[i]) * (y - a / (1 + exp(b - c * X[i]))) / (1 + exp(b - c * X[i])) ** 2)
    //     .reduce((sum, d) => sum + d);
    const dc = Y.map((y, i) =>
        -2 * a * b * X[i] * e(-c * X[i]) * (y - a / (1 + b * exp(-c * X[i]))) / (1 + b * exp(-c * X[i])) ** 2
        )
        .reduce((sum, d) => sum + d);

    return dc;
}

// MSE = sum{[y-f(x)]^2}
export function mse(Y: number[], X: number[], a: number, b: number, c: number) {
    const Yhat = model(X, a, b, c);

    const error = Y.reduce((ev, y, i) => ev + (y - Yhat[i]) ** 2, 0) / Y.length;

    return error;
}

type SearchRange = [number, number]
export function gridSearch(values: number[], points: number, a: number, rangeB: SearchRange, rangeC: SearchRange) {
  const X = [-200, ...values.map((v, i) => i)]
  const Y = [0, ...values]

  const gridLength = Math.sqrt(points)
  const bStep = (rangeB[1]-rangeB[0]) / gridLength
  const cStep = (rangeC[1]-rangeC[0]) / gridLength

  let minMse = Infinity
  let minParams = {
    a,
    b: 0,
    c: 0,
  }
  // for (let a = rangeA[0]; a <= rangeA[2]; a += rangeA[1]) {
    for (let b = rangeB[0]; b <= rangeB[1]; b += bStep) {
      for (let c = rangeC[0]; c <= rangeC[1];  c += cStep) {
        const currentMse = mse(Y, X, a, b, c)
        if (currentMse < minMse) {
          minMse = currentMse
          minParams = { a, b, c}
        }
      }
    }
  // }

  // console.log(minParams)


  return minParams
}

export default function scurveFit(values: number[], a: number, b: number, c: number, interations = 1000) {
    const X = [-200, ...values.map((v, i) => i)]
    const Y = [0, ...values]

    // let aStep = 0.00000000001
    let bStep = 0.000000000002
    let cStep = 0.000000000002

    let da, db, dc;
    for (let i = 0; i < interations; ++i) {
      // da = aDirectionComponent(Y, X, a, b, c);
      db = bDirectionComponent(Y, X, a, b, c)
      dc = cDirectionComponent(Y, X, a, b, c)
      
      dc = Math.abs(dc) > 0.01 ? 0.0001 * dc : dc

      // a -= aStep * da;
      b -= bStep * db
      c -= cStep * dc

      // aStep *= 1.0001
      // bStep *= 1.0001
      // cStep *= 1.0001
    }

    // console.log('a b c', a, b, c);
    // console.log('d/dx', da, db, dc);
    // const currentMse = mse(Y, X, a, b, c)
    // const yhat = model(X, a, b, c);

    // console.log('current_mse', {a, b, c}, Math.log10(currentMse));

    return {
        func: (x: number) => model([x], a, b, c)[0],
        params: `a: ${a}, b: ${b}, c: ${c}`,
        a,
        b,
        c,
    }
}


/**
 * // https://mathworld.wolfram.com/LeastSquaresFittingExponential.html
 * @param seriesInput 
 */
export function exponentialFit(seriesInput: number[]) {
    const series = seriesInput.map(v => v < 1 ? 1 : v);

    const Y = series.reduce((sum, y) => sum + y, 0);
    const XY = series.reduce((sum, y, x) => sum + x * y, 0);
    const X2Y  = series.reduce((sum, y, x) => sum + x ** 2 * y, 0);
    const YlnY  = series.reduce((sum, y, x) => sum + y * Math.log(y), 0);
    const XYlnY  = series.reduce((sum, y, x) => sum + x * y * Math.log(y), 0);

    const a = (X2Y * YlnY - XY * XYlnY) / (Y * X2Y - XY ** 2);
    const b = (Y * XYlnY - XY * YlnY) / (Y * X2Y - XY ** 2);

    console.log(Y, XY, X2Y, YlnY, XYlnY);
    console.log('a', a, 'b', b);

    return {
        func: (x: number) => Math.exp(a) * Math.exp(b * x),
        params: `a: ${a}, b: ${b}`
    };
}

/**
 * @param {} series -
 *
 * http://mathworld.wolfram.com/LeastSquaresFitting.html
 */
export function linearFit(values: number[]) {
    const N = values.length;
  
    var mt = values.reduce((sum, _, t) => sum + t, 0) / N;
    var mx = values.reduce((sum, x) => sum + x, 0) / N;
  
    var sstt = values.reduce((sum, _, t) => sum + (t - mt) ** 2, 0);
    // var ssxx = values.reduce((sum, x) => sum + (x - mx) ** 2, 0);
    var sstx = values.reduce((cov, x, t) => cov + t * x, 0) - N * mt * mx;

    // std: Math.sqrt(ssxx),
    // fitt: sstx * sstx / sstt / ssxx,

    var slope = sstx / sstt;
    var bias = mx - slope * mt;
  
    return {
        func: (x: number) => bias + slope * x,
        params: `bias: ${bias}, slope: ${slope}`
    };
}

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

export default function scurveFit(values: number[], a: number, b: number, c: number) {
    // const X = [0,     1,     2,      3,      4,      5,      6     ];
    // const Y = [0.260, 2.425, 9.766, 28.578, 53.239, 63.150, 62.950 ];
    const X = values.map((v, i) => i);
    const Y = values;

    // let a = Math.max(...Y);
    // let b = Math.max(...X) * 2 / 3;
    // let c = 1;
    // let a = 5722;
    // let b = 13.26;
    // let c = 0.3532;
    // let a = 3000 * 10; // 57220 / 6;
    // let b = 6.50;
    // let c = 0.07;

    // let a = 30000.000775963497;
    // let b = 5.312977760629299;
    // let c = 0.050223430863097926;
    
    // let a = Math.max(...Y);
    // let b = Math.max(...X) / 2;
    // let c = 0.050223430863097926;

    // const error = mse(X, Y, a, b, c);

    // console.log('mse', Math.log10(error), a, b, c);

    const aStep = 0.000002;
    const bStep = 0.000002;
    const cStep = 0.00000000002;

    let da, db, dc;
    for (let i = 0; i < 100000; ++i) {
    // for (let i = 0; i < 2; ++i) {
        da = aDirectionComponent(Y, X, a, b, c);
        db = bDirectionComponent(Y, X, a, b, c);
        dc = cDirectionComponent(Y, X, a, b, c);
        
        dc = Math.abs(dc) > 0.1 ? 0.01 * dc : dc;

        a -= aStep * da;
        b -= bStep * db;
        c -= cStep * dc;
    }

    // console.log('a b c', a, b, c);
    console.log('d/dx', da, db, dc);
    const currentMse = mse(Y, X, a, b, c);
    // const yhat = model(X, a, b, c);

    console.log('current_mse', Math.log10(currentMse));

    return {
        func: (x: number) => model([x], a, b, c)[0],
        params: `a: ${a}, b: ${b}, c: ${c}`,
        a,
        b,
        c,
    };
}

    // for i=1:4000
    //     gradient = [
    //         a_direction_component(y, x, a, b, c)
    //         b_direction_component(y, x, a, b, c)
    //         c_direction_component(y, x, a, b, c)
    //     ];
        
    //     a = a - step * gradient(1);
    //     b = b - step * gradient(2);
    //     c = c - step * gradient(3);
        
    //     % disp(a)
    //     % current_mse = mse(y, x, a, b, c);
    // end

// Fit S curve from octave
//   disp("Hello World");

// clear

// % training set: samples from the real world
// x = [0,     1,     2,      3,      4,      5,      6     ];
// y = [0.260, 2.425, 9.766, 28.578, 53.239, 63.150, 62.950 ];
// % our true model would produce: 26, 19, 14, 11, 10, 11, 14, 19, 26
// % it is in fact y = x^2 + 10

// function d = model(x, a, b, c)
//     d = a ./ (1 + exp(b - c*x));
// end

// function d = a_direction_component(y, x, a, b, c)
//     d = sum(-2 * (y - a ./ (1 + exp(b - c*x))) ./ (1 + exp(b - c*x)));
// end

// function d = b_direction_component(y, x, a, b, c)
//     d = sum(2 * a * exp(b - c*x) .* (y - a ./ (1 + exp(b - c*x))) ./ (1 + exp(b - c*x)).^2);
// end

// function d = c_direction_component(y, x, a, b, c)
//     d = sum(-2 * a * x .* exp(b - c*x) .* (y - a ./ (1 + exp(b - c*x))) ./ (1 + exp(b - c*x)).^2);
// end

// % looking for a model y = f(x) = a*x^2 + c
// % MSE = sum{[y-f(x)]^2}
// function result = mse(y, x, a, b, c)
//     result = 0;
//     for i=1:size(x, 2)  % could be done with matrices, but I prefer to be clear
//         result = result + (y(i) - model(x(i), a, b, c))^2;
//     end
//     result = result / size(x, 2);
// end

// % initialization
// a = 67.982;
// b = 4.8346;
// c = 1.5134;
// step = 0.00015;
// mse(y, x, a, b, c)

// for i=1:4000
//     gradient = [
//         a_direction_component(y, x, a, b, c)
//         b_direction_component(y, x, a, b, c)
//         c_direction_component(y, x, a, b, c)
//     ];
    
//     a = a - step * gradient(1);
//     b = b - step * gradient(2);
//     c = c - step * gradient(3);
    
//     % disp(a)
//     % current_mse = mse(y, x, a, b, c);
// end

// gradient

// % a = 1;
// % b = 0;
// % c = 1;

// a
// b
// c
// current_mse = mse(y, x, a, b, c)

// xhat = 0:1:10;
// yhat = model(xhat, a, b, c);

// x
// y
// yhat

// plot(x, y, xhat, yhat)

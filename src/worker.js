export default () => {
    const exp = Math.exp;

    function model(X, a, b, c) {
        const m = X.map(x => a / (1 + b * exp(-c * x)));

        return m;
    }

    function aDirectionComponent(Y, X, a, b, c) {
        const da = Y.map((y, i) =>
            -2 * (y - a / (1 + b * exp(-c*X[i]))) / (1 + b * exp(-c*X[i])))
            .reduce((sum, d) => sum + d);

        return da;
    }

    function bDirectionComponent(Y, X, a, b, c) {
        const db = Y.map((y, i) =>
            2 * a * exp(-c * X[i]) * (y - a / (1 + b * exp(-c*X[i]))) / ((1 + b * exp(-c*X[i])) ** 2))
            .reduce((sum, d) => sum + d);

        return db;
    }

    function cDirectionComponent(Y, X, a, b, c) {
        const dc = Y.map((y, i) =>
            -2 * a * b * X[i] * exp(-c * X[i]) * (y - a / (1 + b * exp(-c*X[i]))) / ((1 + b * exp(-c * X[i])) ** 2 ));

        // console.log('dc', a, b, c, Y, X, model(X, a, b, c).map((yhat, i) => Y[i] - yhat), dc.filter(v => v > 0).length);

        return dc.reduce((sum, d) => sum + d);
    }

    // MSE = sum{[y-f(x)]^2}
    function mse(Y, X, a, b, c) {
        const Yhat = model(X, a, b, c);

        const error = Y.reduce((e, y, i) => e + (y - Yhat[i]) ** 2, 0) / Y.length;

        return error;
    }

    function scurveFit(values, a, b, c) {
        const time = Date.now();
        const X = values.map((v, i) => i + 1);
        const Y = values;

        let step = 0.01;
        // let bStep = 0.000000000001;
        // let cStep = 0.000000000001;
        error = mse(Y, X, a, b, c);

        let da, db, dc;
        // let swe = 0;
        for (let i = 0; i < 100000; ++i) {
        // for (let i = 0; i < 2; ++i) {
            da = aDirectionComponent(Y, X, a, b, c);
            db = bDirectionComponent(Y, X, a, b, c);
            dc = cDirectionComponent(Y, X, a, b, c);
            
            // error2 = mse(X, Y, da, db, dc);
            // console.log('errors', error2, error);

            // if (Math.abs(step * dc) > 0.002) {
            //     ++swe;
            //     // console.log('step!', step, Math.abs(step * db), Math.abs(step * dc));
            //     step = 1 / (1000 * Math.abs(dc));
            // }

            a -= 0.0001 * da;
            b -= 0.0001 * db;
            c -= Math.sign(dc) * Math.min(0.0001 * Math.random(), Math.abs(dc));
            // c -= 0.000001 * Math.sign(dc) * Math.sqrt(Math.abs(dc));
            // step *= 1.1;
        }

        console.log('AEG!!', Math.sign(dc) * Math.min(0.0001, Math.abs(dc)));
        // console.log('Step', swe, step, Math.log10(step));

        const currentMse = mse(Y, X, a, b, c);
        console.log('MSE diff', error - currentMse);
        console.log('da', da, 'db', db, 'dc', dc);
        // const yhat = model(X, a, b, c);

        // while(Date.now() - time < 400) {
        //     var dummy = 3
        //     ++dummy;
        // }

        // console.log('current_mse', Math.log10(currentMse));

        return { a, b, c };
    }

	self.addEventListener('message', e => { // eslint-disable-line no-restricted-globals
		if (!e) return;

        // console.log('Message: ', e.data);

        // let a = 1000; // Math.max(...Y);
        // let b = 0; // Math.max(...X) / 2;
        // let c = 0.050223430863097926;

        // b c 1643.9856150135822 11.203180394886619 0.3147872489870269
        // 1643.9828018696933 11.203155979565114 0.3147868434541137
        // 1632.9670563893671 11.106966103165032 0.31317579295497766
        // let fit = { a: 6000, b: 0.1 * 12 * 5, c: 0.10 };
        let fit = { a: 1, b: 1, c: 1 };
        // let fit = { a: 2711.0218031067675, b: 10, c: 0.08521915920234995 };
        // let fit = { a: 25694.5736578658516, b: 185.007476021408166, c: 0.0507181818 };

        for (let i = 0; i < 30; ++i) {
            fit = scurveFit(e.data, fit.a, fit.b, fit.c);
            postMessage(fit);
        }
	})
}

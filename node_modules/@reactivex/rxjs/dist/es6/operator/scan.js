import { Subscriber } from '../Subscriber';
/**
 * Returns an Observable that applies a specified accumulator function to each item emitted by the source Observable.
 * If a seed value is specified, then that value will be used as the initial value for the accumulator.
 * If no seed value is specified, the first item of the source is used as the seed.
 * @param {function} accumulator The accumulator function called on each item.
 *
 * <img src="./img/scan.png" width="100%">
 *
 * @param {any} [seed] The initial accumulator value.
 * @returns {Obervable} An observable of the accumulated values.
 */
export function scan(accumulator, seed) {
    return this.lift(new ScanOperator(accumulator, seed));
}
class ScanOperator {
    constructor(accumulator, seed) {
        this.accumulator = accumulator;
        this.seed = seed;
    }
    call(subscriber) {
        return new ScanSubscriber(subscriber, this.accumulator, this.seed);
    }
}
class ScanSubscriber extends Subscriber {
    constructor(destination, accumulator, seed) {
        super(destination);
        this.accumulator = accumulator;
        this.accumulatorSet = false;
        this.seed = seed;
        this.accumulator = accumulator;
        this.accumulatorSet = typeof seed !== 'undefined';
    }
    get seed() {
        return this._seed;
    }
    set seed(value) {
        this.accumulatorSet = true;
        this._seed = value;
    }
    _next(value) {
        if (!this.accumulatorSet) {
            this.seed = value;
            this.destination.next(value);
        }
        else {
            return this._tryNext(value);
        }
    }
    _tryNext(value) {
        let result;
        try {
            result = this.accumulator(this.seed, value);
        }
        catch (err) {
            this.destination.error(err);
        }
        this.seed = result;
        this.destination.next(result);
    }
}
//# sourceMappingURL=scan.js.map
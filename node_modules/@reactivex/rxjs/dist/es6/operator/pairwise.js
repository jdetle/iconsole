import { Subscriber } from '../Subscriber';
/**
 * Returns a new observable that triggers on the second and following inputs.
 * An input that triggers an event will return an pair of [(N - 1)th, Nth].
 * The (N-1)th is stored in the internal state until Nth input occurs.
 *
 * <img src="./img/pairwise.png" width="100%">
 *
 * @returns {Observable<R>} an observable of pairs of values.
 */
export function pairwise() {
    return this.lift(new PairwiseOperator());
}
class PairwiseOperator {
    call(subscriber) {
        return new PairwiseSubscriber(subscriber);
    }
}
class PairwiseSubscriber extends Subscriber {
    constructor(destination) {
        super(destination);
        this.hasPrev = false;
    }
    _next(value) {
        if (this.hasPrev) {
            this.destination.next([this.prev, value]);
        }
        else {
            this.hasPrev = true;
        }
        this.prev = value;
    }
}
//# sourceMappingURL=pairwise.js.map
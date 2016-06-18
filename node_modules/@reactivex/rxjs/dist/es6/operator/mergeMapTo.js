import { OuterSubscriber } from '../OuterSubscriber';
import { subscribeToResult } from '../util/subscribeToResult';
export function mergeMapTo(observable, resultSelector, concurrent = Number.POSITIVE_INFINITY) {
    return this.lift(new MergeMapToOperator(observable, resultSelector, concurrent));
}
// TODO: Figure out correct signature here: an Operator<Observable<T>, R2>
//       needs to implement call(observer: Subscriber<R2>): Subscriber<Observable<T>>
export class MergeMapToOperator {
    constructor(ish, resultSelector, concurrent = Number.POSITIVE_INFINITY) {
        this.ish = ish;
        this.resultSelector = resultSelector;
        this.concurrent = concurrent;
    }
    call(observer) {
        return new MergeMapToSubscriber(observer, this.ish, this.resultSelector, this.concurrent);
    }
}
export class MergeMapToSubscriber extends OuterSubscriber {
    constructor(destination, ish, resultSelector, concurrent = Number.POSITIVE_INFINITY) {
        super(destination);
        this.ish = ish;
        this.resultSelector = resultSelector;
        this.concurrent = concurrent;
        this.hasCompleted = false;
        this.buffer = [];
        this.active = 0;
        this.index = 0;
    }
    _next(value) {
        if (this.active < this.concurrent) {
            const resultSelector = this.resultSelector;
            const index = this.index++;
            const ish = this.ish;
            const destination = this.destination;
            this.active++;
            this._innerSub(ish, destination, resultSelector, value, index);
        }
        else {
            this.buffer.push(value);
        }
    }
    _innerSub(ish, destination, resultSelector, value, index) {
        this.add(subscribeToResult(this, ish, value, index));
    }
    _complete() {
        this.hasCompleted = true;
        if (this.active === 0 && this.buffer.length === 0) {
            this.destination.complete();
        }
    }
    notifyNext(outerValue, innerValue, outerIndex, innerIndex, innerSub) {
        const { resultSelector, destination } = this;
        if (resultSelector) {
            this.trySelectResult(outerValue, innerValue, outerIndex, innerIndex);
        }
        else {
            destination.next(innerValue);
        }
    }
    trySelectResult(outerValue, innerValue, outerIndex, innerIndex) {
        const { resultSelector, destination } = this;
        let result;
        try {
            result = resultSelector(outerValue, innerValue, outerIndex, innerIndex);
        }
        catch (err) {
            destination.error(err);
            return;
        }
        destination.next(result);
    }
    notifyError(err) {
        this.destination.error(err);
    }
    notifyComplete(innerSub) {
        const buffer = this.buffer;
        this.remove(innerSub);
        this.active--;
        if (buffer.length > 0) {
            this._next(buffer.shift());
        }
        else if (this.active === 0 && this.hasCompleted) {
            this.destination.complete();
        }
    }
}
//# sourceMappingURL=mergeMapTo.js.map
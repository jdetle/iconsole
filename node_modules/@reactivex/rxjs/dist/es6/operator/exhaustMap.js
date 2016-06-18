import { OuterSubscriber } from '../OuterSubscriber';
import { subscribeToResult } from '../util/subscribeToResult';
/**
 * Returns an Observable that applies the given function to each item of the source Observable
 * to create a new Observable, which are then concatenated together to produce a new Observable.
 * @param {function} project function called for each item of the source to produce a new Observable.
 * @param {function} [resultSelector] optional function for then selecting on each inner Observable.
 * @returns {Observable} an Observable containing all the projected Observables of each item of the source concatenated together.
 */
export function exhaustMap(project, resultSelector) {
    return this.lift(new SwitchFirstMapOperator(project, resultSelector));
}
class SwitchFirstMapOperator {
    constructor(project, resultSelector) {
        this.project = project;
        this.resultSelector = resultSelector;
    }
    call(subscriber) {
        return new SwitchFirstMapSubscriber(subscriber, this.project, this.resultSelector);
    }
}
class SwitchFirstMapSubscriber extends OuterSubscriber {
    constructor(destination, project, resultSelector) {
        super(destination);
        this.project = project;
        this.resultSelector = resultSelector;
        this.hasSubscription = false;
        this.hasCompleted = false;
        this.index = 0;
    }
    _next(value) {
        if (!this.hasSubscription) {
            this.tryNext(value);
        }
    }
    tryNext(value) {
        const index = this.index++;
        const destination = this.destination;
        try {
            const result = this.project(value, index);
            this.hasSubscription = true;
            this.add(subscribeToResult(this, result, value, index));
        }
        catch (err) {
            destination.error(err);
        }
    }
    _complete() {
        this.hasCompleted = true;
        if (!this.hasSubscription) {
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
        try {
            const result = resultSelector(outerValue, innerValue, outerIndex, innerIndex);
            destination.next(result);
        }
        catch (err) {
            destination.error(err);
        }
    }
    notifyError(err) {
        this.destination.error(err);
    }
    notifyComplete() {
        this.hasSubscription = false;
        if (this.hasCompleted) {
            this.destination.complete();
        }
    }
}
//# sourceMappingURL=exhaustMap.js.map
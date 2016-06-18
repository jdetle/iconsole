import { OuterSubscriber } from '../OuterSubscriber';
import { subscribeToResult } from '../util/subscribeToResult';
/**
 * Converts an Observable that emits Observables into an Observable that emits the items emitted by the most recently
 * emitted of those Observables.
 *
 * <img src="./img/switch.png" width="100%">
 *
 * Switch subscribes to an Observable that emits Observables. Each time it observes one of these emitted Observables,
 * the Observable returned by switchOnNext begins emitting the items emitted by that Observable. When a new Observable
 * is emitted, switchOnNext stops emitting items from the earlier-emitted Observable and begins emitting items from the
 * new one.
 *
 * @param {Function} a predicate function to evaluate items emitted by the source Observable.
 * @returns {Observable<T>} an Observable that emits the items emitted by the Observable most recently emitted by the
 * source Observable.
 */
export function _switch() {
    return this.lift(new SwitchOperator());
}
class SwitchOperator {
    call(subscriber) {
        return new SwitchSubscriber(subscriber);
    }
}
class SwitchSubscriber extends OuterSubscriber {
    constructor(destination) {
        super(destination);
        this.active = 0;
        this.hasCompleted = false;
    }
    _next(value) {
        this.unsubscribeInner();
        this.active++;
        this.add(this.innerSubscription = subscribeToResult(this, value));
    }
    _complete() {
        this.hasCompleted = true;
        if (this.active === 0) {
            this.destination.complete();
        }
    }
    unsubscribeInner() {
        this.active = this.active > 0 ? this.active - 1 : 0;
        const innerSubscription = this.innerSubscription;
        if (innerSubscription) {
            innerSubscription.unsubscribe();
            this.remove(innerSubscription);
        }
    }
    notifyNext(outerValue, innerValue, outerIndex, innerIndex, innerSub) {
        this.destination.next(innerValue);
    }
    notifyError(err) {
        this.destination.error(err);
    }
    notifyComplete() {
        this.unsubscribeInner();
        if (this.hasCompleted && this.active === 0) {
            this.destination.complete();
        }
    }
}
//# sourceMappingURL=switch.js.map
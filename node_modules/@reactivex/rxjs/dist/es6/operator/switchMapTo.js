import { OuterSubscriber } from '../OuterSubscriber';
import { subscribeToResult } from '../util/subscribeToResult';
export function switchMapTo(observable, resultSelector) {
    return this.lift(new SwitchMapToOperator(observable, resultSelector));
}
class SwitchMapToOperator {
    constructor(observable, resultSelector) {
        this.observable = observable;
        this.resultSelector = resultSelector;
    }
    call(subscriber) {
        return new SwitchMapToSubscriber(subscriber, this.observable, this.resultSelector);
    }
}
class SwitchMapToSubscriber extends OuterSubscriber {
    constructor(destination, inner, resultSelector) {
        super(destination);
        this.inner = inner;
        this.resultSelector = resultSelector;
        this.index = 0;
    }
    _next(value) {
        const innerSubscription = this.innerSubscription;
        if (innerSubscription) {
            innerSubscription.unsubscribe();
        }
        this.add(this.innerSubscription = subscribeToResult(this, this.inner, value, this.index++));
    }
    _complete() {
        const { innerSubscription } = this;
        if (!innerSubscription || innerSubscription.isUnsubscribed) {
            super._complete();
        }
    }
    _unsubscribe() {
        this.innerSubscription = null;
    }
    notifyComplete(innerSub) {
        this.remove(innerSub);
        this.innerSubscription = null;
        if (this.isStopped) {
            super._complete();
        }
    }
    notifyNext(outerValue, innerValue, outerIndex, innerIndex, innerSub) {
        const { resultSelector, destination } = this;
        if (resultSelector) {
            this.tryResultSelector(outerValue, innerValue, outerIndex, innerIndex);
        }
        else {
            destination.next(innerValue);
        }
    }
    tryResultSelector(outerValue, innerValue, outerIndex, innerIndex) {
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
}
//# sourceMappingURL=switchMapTo.js.map
import { OuterSubscriber } from '../OuterSubscriber';
import { subscribeToResult } from '../util/subscribeToResult';
export function throttle(durationSelector) {
    return this.lift(new ThrottleOperator(durationSelector));
}
class ThrottleOperator {
    constructor(durationSelector) {
        this.durationSelector = durationSelector;
    }
    call(subscriber) {
        return new ThrottleSubscriber(subscriber, this.durationSelector);
    }
}
class ThrottleSubscriber extends OuterSubscriber {
    constructor(destination, durationSelector) {
        super(destination);
        this.destination = destination;
        this.durationSelector = durationSelector;
    }
    _next(value) {
        if (!this.throttled) {
            this.tryDurationSelector(value);
        }
    }
    tryDurationSelector(value) {
        let duration = null;
        try {
            duration = this.durationSelector(value);
        }
        catch (err) {
            this.destination.error(err);
            return;
        }
        this.emitAndThrottle(value, duration);
    }
    emitAndThrottle(value, duration) {
        this.add(this.throttled = subscribeToResult(this, duration));
        this.destination.next(value);
    }
    _unsubscribe() {
        const throttled = this.throttled;
        if (throttled) {
            this.remove(throttled);
            this.throttled = null;
            throttled.unsubscribe();
        }
    }
    notifyNext(outerValue, innerValue, outerIndex, innerIndex, innerSub) {
        this._unsubscribe();
    }
    notifyComplete() {
        this._unsubscribe();
    }
}
//# sourceMappingURL=throttle.js.map
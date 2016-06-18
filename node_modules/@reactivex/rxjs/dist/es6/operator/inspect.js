import { tryCatch } from '../util/tryCatch';
import { errorObject } from '../util/errorObject';
import { OuterSubscriber } from '../OuterSubscriber';
import { subscribeToResult } from '../util/subscribeToResult';
export function inspect(durationSelector) {
    return this.lift(new InspectOperator(durationSelector));
}
class InspectOperator {
    constructor(durationSelector) {
        this.durationSelector = durationSelector;
    }
    call(subscriber) {
        return new InspectSubscriber(subscriber, this.durationSelector);
    }
}
class InspectSubscriber extends OuterSubscriber {
    constructor(destination, durationSelector) {
        super(destination);
        this.durationSelector = durationSelector;
        this.hasValue = false;
    }
    _next(value) {
        this.value = value;
        this.hasValue = true;
        if (!this.throttled) {
            const duration = tryCatch(this.durationSelector)(value);
            if (duration === errorObject) {
                this.destination.error(errorObject.e);
            }
            else {
                this.add(this.throttled = subscribeToResult(this, duration));
            }
        }
    }
    clearThrottle() {
        const { value, hasValue, throttled } = this;
        if (throttled) {
            this.remove(throttled);
            this.throttled = null;
            throttled.unsubscribe();
        }
        if (hasValue) {
            this.value = null;
            this.hasValue = false;
            this.destination.next(value);
        }
    }
    notifyNext(outerValue, innerValue, outerIndex, innerIndex) {
        this.clearThrottle();
    }
    notifyComplete() {
        this.clearThrottle();
    }
}
//# sourceMappingURL=inspect.js.map
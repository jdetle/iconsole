import { asap } from '../scheduler/asap';
import { Subscriber } from '../Subscriber';
export function inspectTime(delay, scheduler = asap) {
    return this.lift(new InspectTimeOperator(delay, scheduler));
}
class InspectTimeOperator {
    constructor(delay, scheduler) {
        this.delay = delay;
        this.scheduler = scheduler;
    }
    call(subscriber) {
        return new InspectTimeSubscriber(subscriber, this.delay, this.scheduler);
    }
}
class InspectTimeSubscriber extends Subscriber {
    constructor(destination, delay, scheduler) {
        super(destination);
        this.delay = delay;
        this.scheduler = scheduler;
        this.hasValue = false;
    }
    _next(value) {
        this.value = value;
        this.hasValue = true;
        if (!this.throttled) {
            this.add(this.throttled = this.scheduler.schedule(dispatchNext, this.delay, this));
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
}
function dispatchNext(subscriber) {
    subscriber.clearThrottle();
}
//# sourceMappingURL=inspectTime.js.map
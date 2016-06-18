import { Subscriber } from '../Subscriber';
import { asap } from '../scheduler/asap';
export function throttleTime(delay, scheduler = asap) {
    return this.lift(new ThrottleTimeOperator(delay, scheduler));
}
class ThrottleTimeOperator {
    constructor(delay, scheduler) {
        this.delay = delay;
        this.scheduler = scheduler;
    }
    call(subscriber) {
        return new ThrottleTimeSubscriber(subscriber, this.delay, this.scheduler);
    }
}
class ThrottleTimeSubscriber extends Subscriber {
    constructor(destination, delay, scheduler) {
        super(destination);
        this.delay = delay;
        this.scheduler = scheduler;
    }
    _next(value) {
        if (!this.throttled) {
            this.add(this.throttled = this.scheduler.schedule(dispatchNext, this.delay, { subscriber: this }));
            this.destination.next(value);
        }
    }
    clearThrottle() {
        const throttled = this.throttled;
        if (throttled) {
            throttled.unsubscribe();
            this.remove(throttled);
            this.throttled = null;
        }
    }
}
function dispatchNext({ subscriber }) {
    subscriber.clearThrottle();
}
//# sourceMappingURL=throttleTime.js.map
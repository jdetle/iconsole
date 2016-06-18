import { Subscriber } from '../Subscriber';
import { asap } from '../scheduler/asap';
/**
 * Returns the source Observable delayed by the computed debounce duration,
 * with the duration lengthened if a new source item arrives before the delay
 * duration ends.
 * In practice, for each item emitted on the source, this operator holds the
 * latest item, waits for a silence for the `dueTime` length, and only then
 * emits the latest source item on the result Observable.
 * Optionally takes a scheduler for manging timers.
 * @param {number} dueTime the timeout value for the window of time required to not drop the item.
 * @param {Scheduler} [scheduler] the Scheduler to use for managing the timers that handle the timeout for each item.
 * @returns {Observable} an Observable the same as source Observable, but drops items.
 */
export function debounceTime(dueTime, scheduler = asap) {
    return this.lift(new DebounceTimeOperator(dueTime, scheduler));
}
class DebounceTimeOperator {
    constructor(dueTime, scheduler) {
        this.dueTime = dueTime;
        this.scheduler = scheduler;
    }
    call(subscriber) {
        return new DebounceTimeSubscriber(subscriber, this.dueTime, this.scheduler);
    }
}
class DebounceTimeSubscriber extends Subscriber {
    constructor(destination, dueTime, scheduler) {
        super(destination);
        this.dueTime = dueTime;
        this.scheduler = scheduler;
        this.debouncedSubscription = null;
        this.lastValue = null;
        this.hasValue = false;
    }
    _next(value) {
        this.clearDebounce();
        this.lastValue = value;
        this.hasValue = true;
        this.add(this.debouncedSubscription = this.scheduler.schedule(dispatchNext, this.dueTime, this));
    }
    _complete() {
        this.debouncedNext();
        this.destination.complete();
    }
    debouncedNext() {
        this.clearDebounce();
        if (this.hasValue) {
            this.destination.next(this.lastValue);
            this.lastValue = null;
            this.hasValue = false;
        }
    }
    clearDebounce() {
        const debouncedSubscription = this.debouncedSubscription;
        if (debouncedSubscription !== null) {
            this.remove(debouncedSubscription);
            debouncedSubscription.unsubscribe();
            this.debouncedSubscription = null;
        }
    }
}
function dispatchNext(subscriber) {
    subscriber.debouncedNext();
}
//# sourceMappingURL=debounceTime.js.map
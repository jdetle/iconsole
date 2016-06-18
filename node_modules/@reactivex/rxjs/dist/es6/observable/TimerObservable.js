import { isNumeric } from '../util/isNumeric';
import { Observable } from '../Observable';
import { asap } from '../scheduler/asap';
import { isScheduler } from '../util/isScheduler';
import { isDate } from '../util/isDate';
export class TimerObservable extends Observable {
    constructor(dueTime = 0, period, scheduler) {
        super();
        this.period = -1;
        this.dueTime = 0;
        if (isNumeric(period)) {
            this.period = Number(period) < 1 && 1 || Number(period);
        }
        else if (isScheduler(period)) {
            scheduler = period;
        }
        if (!isScheduler(scheduler)) {
            scheduler = asap;
        }
        this.scheduler = scheduler;
        this.dueTime = isDate(dueTime) ?
            (+dueTime - this.scheduler.now()) :
            dueTime;
    }
    static create(dueTime = 0, period, scheduler) {
        return new TimerObservable(dueTime, period, scheduler);
    }
    static dispatch(state) {
        const { index, period, subscriber } = state;
        const action = this;
        subscriber.next(index);
        if (subscriber.isUnsubscribed) {
            return;
        }
        else if (period === -1) {
            return subscriber.complete();
        }
        state.index = index + 1;
        action.schedule(state, period);
    }
    _subscribe(subscriber) {
        const index = 0;
        const { period, dueTime, scheduler } = this;
        return scheduler.schedule(TimerObservable.dispatch, dueTime, {
            index, period, subscriber
        });
    }
}
//# sourceMappingURL=TimerObservable.js.map
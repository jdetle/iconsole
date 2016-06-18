import { Subscriber } from '../Subscriber';
import { asap } from '../scheduler/asap';
/**
 * Buffers values from the source for a specific time period. Optionally allows
 * new buffers to be set up at an interval.
 *
 * <img src="./img/bufferTime.png" width="100%">
 *
 * @param {number} bufferTimeSpan the amount of time to fill each buffer for
 * before emitting them and clearing them.
 * @param {number} [bufferCreationInterval] the interval at which to start new
 * buffers.
 * @param {Scheduler} [scheduler] (optional, defaults to `asap` scheduler) The
 * scheduler on which to schedule the intervals that determine buffer
 * boundaries.
 * @returns {Observable<T[]>} an observable of arrays of buffered values.
 */
export function bufferTime(bufferTimeSpan, bufferCreationInterval = null, scheduler = asap) {
    return this.lift(new BufferTimeOperator(bufferTimeSpan, bufferCreationInterval, scheduler));
}
class BufferTimeOperator {
    constructor(bufferTimeSpan, bufferCreationInterval, scheduler) {
        this.bufferTimeSpan = bufferTimeSpan;
        this.bufferCreationInterval = bufferCreationInterval;
        this.scheduler = scheduler;
    }
    call(subscriber) {
        return new BufferTimeSubscriber(subscriber, this.bufferTimeSpan, this.bufferCreationInterval, this.scheduler);
    }
}
class BufferTimeSubscriber extends Subscriber {
    constructor(destination, bufferTimeSpan, bufferCreationInterval, scheduler) {
        super(destination);
        this.bufferTimeSpan = bufferTimeSpan;
        this.bufferCreationInterval = bufferCreationInterval;
        this.scheduler = scheduler;
        this.buffers = [];
        const buffer = this.openBuffer();
        if (bufferCreationInterval !== null && bufferCreationInterval >= 0) {
            const closeState = { subscriber: this, buffer };
            const creationState = { bufferTimeSpan, bufferCreationInterval, subscriber: this, scheduler };
            this.add(scheduler.schedule(dispatchBufferClose, bufferTimeSpan, closeState));
            this.add(scheduler.schedule(dispatchBufferCreation, bufferCreationInterval, creationState));
        }
        else {
            const timeSpanOnlyState = { subscriber: this, buffer, bufferTimeSpan };
            this.add(scheduler.schedule(dispatchBufferTimeSpanOnly, bufferTimeSpan, timeSpanOnlyState));
        }
    }
    _next(value) {
        const buffers = this.buffers;
        const len = buffers.length;
        for (let i = 0; i < len; i++) {
            buffers[i].push(value);
        }
    }
    _error(err) {
        this.buffers.length = 0;
        super._error(err);
    }
    _complete() {
        const { buffers, destination } = this;
        while (buffers.length > 0) {
            destination.next(buffers.shift());
        }
        super._complete();
    }
    _unsubscribe() {
        this.buffers = null;
    }
    openBuffer() {
        let buffer = [];
        this.buffers.push(buffer);
        return buffer;
    }
    closeBuffer(buffer) {
        this.destination.next(buffer);
        const buffers = this.buffers;
        buffers.splice(buffers.indexOf(buffer), 1);
    }
}
function dispatchBufferTimeSpanOnly(state) {
    const subscriber = state.subscriber;
    const prevBuffer = state.buffer;
    if (prevBuffer) {
        subscriber.closeBuffer(prevBuffer);
    }
    state.buffer = subscriber.openBuffer();
    if (!subscriber.isUnsubscribed) {
        this.schedule(state, state.bufferTimeSpan);
    }
}
function dispatchBufferCreation(state) {
    const { bufferCreationInterval, bufferTimeSpan, subscriber, scheduler } = state;
    const buffer = subscriber.openBuffer();
    const action = this;
    if (!subscriber.isUnsubscribed) {
        action.add(scheduler.schedule(dispatchBufferClose, bufferTimeSpan, { subscriber, buffer }));
        action.schedule(state, bufferCreationInterval);
    }
}
function dispatchBufferClose({ subscriber, buffer }) {
    subscriber.closeBuffer(buffer);
}
//# sourceMappingURL=bufferTime.js.map
import { root } from '../util/root';
import { Observable } from '../Observable';
export class PromiseObservable extends Observable {
    constructor(promise, scheduler = null) {
        super();
        this.promise = promise;
        this.scheduler = scheduler;
    }
    static create(promise, scheduler = null) {
        return new PromiseObservable(promise, scheduler);
    }
    _subscribe(subscriber) {
        const promise = this.promise;
        const scheduler = this.scheduler;
        if (scheduler == null) {
            if (this._isScalar) {
                if (!subscriber.isUnsubscribed) {
                    subscriber.next(this.value);
                    subscriber.complete();
                }
            }
            else {
                promise.then((value) => {
                    this.value = value;
                    this._isScalar = true;
                    if (!subscriber.isUnsubscribed) {
                        subscriber.next(value);
                        subscriber.complete();
                    }
                }, (err) => {
                    if (!subscriber.isUnsubscribed) {
                        subscriber.error(err);
                    }
                })
                    .then(null, err => {
                    // escape the promise trap, throw unhandled errors
                    root.setTimeout(() => { throw err; });
                });
            }
        }
        else {
            if (this._isScalar) {
                if (!subscriber.isUnsubscribed) {
                    return scheduler.schedule(dispatchNext, 0, { value: this.value, subscriber });
                }
            }
            else {
                promise.then((value) => {
                    this.value = value;
                    this._isScalar = true;
                    if (!subscriber.isUnsubscribed) {
                        subscriber.add(scheduler.schedule(dispatchNext, 0, { value, subscriber }));
                    }
                }, (err) => {
                    if (!subscriber.isUnsubscribed) {
                        subscriber.add(scheduler.schedule(dispatchError, 0, { err, subscriber }));
                    }
                })
                    .then(null, (err) => {
                    // escape the promise trap, throw unhandled errors
                    root.setTimeout(() => { throw err; });
                });
            }
        }
    }
}
function dispatchNext({ value, subscriber }) {
    if (!subscriber.isUnsubscribed) {
        subscriber.next(value);
        subscriber.complete();
    }
}
function dispatchError({ err, subscriber }) {
    if (!subscriber.isUnsubscribed) {
        subscriber.error(err);
    }
}
//# sourceMappingURL=PromiseObservable.js.map
import { Subscriber } from '../Subscriber';
import { noop } from '../util/noop';
/**
 * Returns a mirrored Observable of the source Observable, but modified so that the provided Observer is called
 * for every item emitted by the source.
 * This operator is useful for debugging your observables for the correct values or performing other side effects.
 * @param {Observer|function} [nextOrObserver] a normal observer callback or callback for onNext.
 * @param {function} [error] callback for errors in the source.
 * @param {function} [complete] callback for the completion of the source.
 * @reurns {Observable} a mirrored Observable with the specified Observer or callback attached for each item.
 */
export function _do(nextOrObserver, error, complete) {
    let next;
    if (nextOrObserver && typeof nextOrObserver === 'object') {
        next = nextOrObserver.next;
        error = nextOrObserver.error;
        complete = nextOrObserver.complete;
    }
    else {
        next = nextOrObserver;
    }
    return this.lift(new DoOperator(next || noop, error || noop, complete || noop));
}
class DoOperator {
    constructor(next, error, complete) {
        this.next = next;
        this.error = error;
        this.complete = complete;
    }
    call(subscriber) {
        return new DoSubscriber(subscriber, this.next, this.error, this.complete);
    }
}
class DoSubscriber extends Subscriber {
    constructor(destination, next, error, complete) {
        super(destination);
        this.__next = next;
        this.__error = error;
        this.__complete = complete;
    }
    // NOTE: important, all try catch blocks below are there for performance
    // reasons. tryCatcher approach does not benefit this operator.
    _next(value) {
        try {
            this.__next(value);
        }
        catch (err) {
            this.destination.error(err);
            return;
        }
        this.destination.next(value);
    }
    _error(err) {
        try {
            this.__error(err);
        }
        catch (err) {
            this.destination.error(err);
            return;
        }
        this.destination.error(err);
    }
    _complete() {
        try {
            this.__complete();
        }
        catch (err) {
            this.destination.error(err);
            return;
        }
        this.destination.complete();
    }
}
//# sourceMappingURL=do.js.map
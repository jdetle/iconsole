import { root } from './util/root';
import { SymbolShim } from './util/SymbolShim';
import { toSubscriber } from './util/toSubscriber';
import { tryCatch } from './util/tryCatch';
import { errorObject } from './util/errorObject';
/**
 * A representation of any set of values over any amount of time. This the most basic building block
 * of RxJS.
 *
 * @class Observable<T>
 */
export class Observable {
    /**
     * @constructor
     * @param {Function} subscribe the function that is
     * called when the Observable is initially subscribed to. This function is given a Subscriber, to which new values
     * can be `next`ed, or an `error` method can be called to raise an error, or `complete` can be called to notify
     * of a successful completion.
     */
    constructor(subscribe) {
        this._isScalar = false;
        if (subscribe) {
            this._subscribe = subscribe;
        }
    }
    /**
     * @method lift
     * @param {Operator} operator the operator defining the operation to take on the observable
     * @returns {Observable} a new observable with the Operator applied
     * @description creates a new Observable, with this Observable as the source, and the passed
     * operator defined as the new observable's operator.
     */
    lift(operator) {
        const observable = new Observable();
        observable.source = this;
        observable.operator = operator;
        return observable;
    }
    /**
     * @method subscribe
     * @param {PartialObserver|Function} observerOrNext (optional) either an observer defining all functions to be called,
     *  or the first of three possible handlers, which is the handler for each value emitted from the observable.
     * @param {Function} error (optional) a handler for a terminal event resulting from an error. If no error handler is provided,
     *  the error will be thrown as unhandled
     * @param {Function} complete (optional) a handler for a terminal event resulting from successful completion.
     * @returns {Subscription} a subscription reference to the registered handlers
     * @description registers handlers for handling emitted values, error and completions from the observable, and
     *  executes the observable's subscriber function, which will take action to set up the underlying data stream
     */
    subscribe(observerOrNext, error, complete) {
        const { operator } = this;
        const subscriber = toSubscriber(observerOrNext, error, complete);
        if (operator) {
            subscriber.add(this._subscribe(operator.call(subscriber)));
        }
        else {
            subscriber.add(this._subscribe(subscriber));
        }
        if (subscriber.syncErrorThrowable) {
            subscriber.syncErrorThrowable = false;
            if (subscriber.syncErrorThrown) {
                throw subscriber.syncErrorValue;
            }
        }
        return subscriber;
    }
    /**
     * @method forEach
     * @param {Function} next a handler for each value emitted by the observable
     * @param {any} [thisArg] a `this` context for the `next` handler function
     * @param {PromiseConstructor} [PromiseCtor] a constructor function used to instantiate the Promise
     * @returns {Promise} a promise that either resolves on observable completion or
     *  rejects with the handled error
     */
    forEach(next, thisArg, PromiseCtor) {
        if (!PromiseCtor) {
            if (root.Rx && root.Rx.config && root.Rx.config.Promise) {
                PromiseCtor = root.Rx.config.Promise;
            }
            else if (root.Promise) {
                PromiseCtor = root.Promise;
            }
        }
        if (!PromiseCtor) {
            throw new Error('no Promise impl found');
        }
        const source = this;
        return new PromiseCtor((resolve, reject) => {
            source.subscribe((value) => {
                const result = tryCatch(next).call(thisArg, value);
                if (result === errorObject) {
                    reject(errorObject.e);
                }
            }, reject, resolve);
        });
    }
    _subscribe(subscriber) {
        return this.source.subscribe(subscriber);
    }
    /**
     * @method Symbol.observable
     * @returns {Observable} this instance of the observable
     * @description an interop point defined by the es7-observable spec https://github.com/zenparsing/es-observable
     */
    [SymbolShim.observable]() {
        return this;
    }
}
// HACK: Since TypeScript inherits static properties too, we have to
// fight against TypeScript here so Subject can have a different static create signature
/**
 * @static
 * @method create
 * @param {Function} subscribe? the subscriber function to be passed to the Observable constructor
 * @returns {Observable} a new cold observable
 * @description creates a new cold Observable by calling the Observable constructor
 */
Observable.create = (subscribe) => {
    return new Observable(subscribe);
};
//# sourceMappingURL=Observable.js.map
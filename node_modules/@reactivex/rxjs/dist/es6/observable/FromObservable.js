import { isArray } from '../util/isArray';
import { isFunction } from '../util/isFunction';
import { isPromise } from '../util/isPromise';
import { isScheduler } from '../util/isScheduler';
import { PromiseObservable } from './PromiseObservable';
import { IteratorObservable } from './IteratorObservable';
import { ArrayObservable } from './ArrayObservable';
import { ArrayLikeObservable } from './ArrayLikeObservable';
import { SymbolShim } from '../util/SymbolShim';
import { Observable } from '../Observable';
import { ObserveOnSubscriber } from '../operator/observeOn';
const isArrayLike = ((x) => x && typeof x.length === 'number');
export class FromObservable extends Observable {
    constructor(ish, scheduler) {
        super(null);
        this.ish = ish;
        this.scheduler = scheduler;
    }
    static create(ish, mapFnOrScheduler, thisArg, lastScheduler) {
        let scheduler = null;
        let mapFn = null;
        if (isFunction(mapFnOrScheduler)) {
            scheduler = lastScheduler || null;
            mapFn = mapFnOrScheduler;
        }
        else if (isScheduler(scheduler)) {
            scheduler = mapFnOrScheduler;
        }
        if (ish != null) {
            if (typeof ish[SymbolShim.observable] === 'function') {
                if (ish instanceof Observable && !scheduler) {
                    return ish;
                }
                return new FromObservable(ish, scheduler);
            }
            else if (isArray(ish)) {
                return new ArrayObservable(ish, scheduler);
            }
            else if (isPromise(ish)) {
                return new PromiseObservable(ish, scheduler);
            }
            else if (typeof ish[SymbolShim.iterator] === 'function' || typeof ish === 'string') {
                return new IteratorObservable(ish, null, null, scheduler);
            }
            else if (isArrayLike(ish)) {
                return new ArrayLikeObservable(ish, mapFn, thisArg, scheduler);
            }
        }
        throw new TypeError((ish !== null && typeof ish || ish) + ' is not observable');
    }
    _subscribe(subscriber) {
        const ish = this.ish;
        const scheduler = this.scheduler;
        if (scheduler == null) {
            return ish[SymbolShim.observable]().subscribe(subscriber);
        }
        else {
            return ish[SymbolShim.observable]().subscribe(new ObserveOnSubscriber(subscriber, scheduler, 0));
        }
    }
}
//# sourceMappingURL=FromObservable.js.map
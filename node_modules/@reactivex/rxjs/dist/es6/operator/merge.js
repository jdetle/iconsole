import { ArrayObservable } from '../observable/ArrayObservable';
import { MergeAllOperator } from './mergeAll';
import { isScheduler } from '../util/isScheduler';
/**
 * Creates a result Observable which emits values from every given input Observable.
 *
 * <img src="./img/merge.png" width="100%">
 *
 * @param {Observable} input Observables
 * @returns {Observable} an Observable that emits items that are the result of every input Observable.
 */
export function merge(...observables) {
    observables.unshift(this);
    return mergeStatic.apply(this, observables);
}
export function mergeStatic(...observables) {
    let concurrent = Number.POSITIVE_INFINITY;
    let scheduler = null;
    let last = observables[observables.length - 1];
    if (isScheduler(last)) {
        scheduler = observables.pop();
        if (observables.length > 1 && typeof observables[observables.length - 1] === 'number') {
            concurrent = observables.pop();
        }
    }
    else if (typeof last === 'number') {
        concurrent = observables.pop();
    }
    if (observables.length === 1) {
        return observables[0];
    }
    return new ArrayObservable(observables, scheduler).lift(new MergeAllOperator(concurrent));
}
//# sourceMappingURL=merge.js.map
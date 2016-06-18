import { isScheduler } from '../util/isScheduler';
import { ArrayObservable } from '../observable/ArrayObservable';
import { MergeAllOperator } from './mergeAll';
/**
 * Joins this observable with multiple other observables by subscribing to them one at a time, starting with the source,
 * and merging their results into the returned observable. Will wait for each observable to complete before moving
 * on to the next.
 * @params {...Observable} the observables to concatenate
 * @params {Scheduler} [scheduler] an optional scheduler to schedule each observable subscription on.
 * @returns {Observable} All values of each passed observable merged into a single observable, in order, in serial fashion.
 */
export function concat(...observables) {
    return concatStatic(this, ...observables);
}
/**
 * Joins multiple observables together by subscribing to them one at a time and merging their results
 * into the returned observable. Will wait for each observable to complete before moving on to the next.
 * @params {...Observable} the observables to concatenate
 * @params {Scheduler} [scheduler] an optional scheduler to schedule each observable subscription on.
 * @returns {Observable} All values of each passed observable merged into a single observable, in order, in serial fashion.
 */
export function concatStatic(...observables) {
    let scheduler = null;
    let args = observables;
    if (isScheduler(args[observables.length - 1])) {
        scheduler = args.pop();
    }
    return new ArrayObservable(observables, scheduler).lift(new MergeAllOperator(1));
}
//# sourceMappingURL=concat.js.map
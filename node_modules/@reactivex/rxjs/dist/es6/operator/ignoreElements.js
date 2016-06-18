import { Subscriber } from '../Subscriber';
import { noop } from '../util/noop';
/**
 * Ignores all items emitted by the source Observable and only passes calls of `complete` or `error`.
 *
 * <img src="./img/ignoreElements.png" width="100%">
 *
 * @returns {Observable} an empty Observable that only calls `complete`
 * or `error`, based on which one is called by the source Observable.
 */
export function ignoreElements() {
    return this.lift(new IgnoreElementsOperator());
}
;
class IgnoreElementsOperator {
    call(subscriber) {
        return new IgnoreElementsSubscriber(subscriber);
    }
}
class IgnoreElementsSubscriber extends Subscriber {
    _next(unused) {
        noop();
    }
}
//# sourceMappingURL=ignoreElements.js.map
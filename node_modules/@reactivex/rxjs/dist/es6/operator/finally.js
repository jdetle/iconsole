import { Subscriber } from '../Subscriber';
import { Subscription } from '../Subscription';
/**
 * Returns an Observable that mirrors the source Observable, but will call a specified function when
 * the source terminates on complete or error.
 * @param {function} finallySelector function to be called when source terminates.
 * @returns {Observable} an Observable that mirrors the source, but will call the specified function on termination.
 */
export function _finally(finallySelector) {
    return this.lift(new FinallyOperator(finallySelector));
}
class FinallyOperator {
    constructor(finallySelector) {
        this.finallySelector = finallySelector;
    }
    call(subscriber) {
        return new FinallySubscriber(subscriber, this.finallySelector);
    }
}
class FinallySubscriber extends Subscriber {
    constructor(destination, finallySelector) {
        super(destination);
        this.add(new Subscription(finallySelector));
    }
}
//# sourceMappingURL=finally.js.map
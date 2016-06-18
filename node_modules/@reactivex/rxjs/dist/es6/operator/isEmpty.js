import { Subscriber } from '../Subscriber';
/**
 * If the source Observable is empty it returns an Observable that emits true, otherwise it emits false.
 *
 * <img src="./img/isEmpty.png" width="100%">
 *
 * @returns {Observable} an Observable that emits a Boolean.
 */
export function isEmpty() {
    return this.lift(new IsEmptyOperator());
}
class IsEmptyOperator {
    call(observer) {
        return new IsEmptySubscriber(observer);
    }
}
class IsEmptySubscriber extends Subscriber {
    constructor(destination) {
        super(destination);
    }
    notifyComplete(isEmpty) {
        const destination = this.destination;
        destination.next(isEmpty);
        destination.complete();
    }
    _next(value) {
        this.notifyComplete(false);
    }
    _complete() {
        this.notifyComplete(true);
    }
}
//# sourceMappingURL=isEmpty.js.map
import { Subscriber } from '../Subscriber';
import { Notification } from '../Notification';
/**
 * Returns an Observable that represents all of the emissions and notifications
 * from the source Observable into emissions marked with their original types
 * within a `Notification` objects.
 *
 * <img src="./img/materialize.png" width="100%">
 *
 * @scheduler materialize does not operate by default on a particular Scheduler.
 * @returns {Observable} an Observable that emits items that are the result of
 * materializing the items and notifications of the source Observable.
 */
export function materialize() {
    return this.lift(new MaterializeOperator());
}
class MaterializeOperator {
    call(subscriber) {
        return new MaterializeSubscriber(subscriber);
    }
}
class MaterializeSubscriber extends Subscriber {
    constructor(destination) {
        super(destination);
    }
    _next(value) {
        this.destination.next(Notification.createNext(value));
    }
    _error(err) {
        const destination = this.destination;
        destination.next(Notification.createError(err));
        destination.complete();
    }
    _complete() {
        const destination = this.destination;
        destination.next(Notification.createComplete());
        destination.complete();
    }
}
//# sourceMappingURL=materialize.js.map
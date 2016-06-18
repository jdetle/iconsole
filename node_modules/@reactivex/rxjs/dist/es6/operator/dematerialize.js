import { Subscriber } from '../Subscriber';
/**
 * Returns an Observable that transforms Notification objects into the items or notifications they represent.
 * @returns {Observable} an Observable that emits items and notifications embedded in Notification objects emitted by the source Observable.
 */
export function dematerialize() {
    return this.lift(new DeMaterializeOperator());
}
class DeMaterializeOperator {
    call(subscriber) {
        return new DeMaterializeSubscriber(subscriber);
    }
}
class DeMaterializeSubscriber extends Subscriber {
    constructor(destination) {
        super(destination);
    }
    _next(value) {
        value.observe(this.destination);
    }
}
//# sourceMappingURL=dematerialize.js.map
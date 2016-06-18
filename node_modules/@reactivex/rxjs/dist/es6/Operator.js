import { Subscriber } from './Subscriber';
export class Operator {
    call(subscriber) {
        return new Subscriber(subscriber);
    }
}
//# sourceMappingURL=Operator.js.map
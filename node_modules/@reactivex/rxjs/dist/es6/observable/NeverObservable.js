import { Observable } from '../Observable';
import { noop } from '../util/noop';
export class NeverObservable extends Observable {
    constructor() {
        super();
    }
    static create() {
        return new NeverObservable();
    }
    _subscribe(subscriber) {
        noop();
    }
}
//# sourceMappingURL=NeverObservable.js.map
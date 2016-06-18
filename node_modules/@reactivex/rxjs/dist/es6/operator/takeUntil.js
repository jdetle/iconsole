import { OuterSubscriber } from '../OuterSubscriber';
import { subscribeToResult } from '../util/subscribeToResult';
export function takeUntil(notifier) {
    return this.lift(new TakeUntilOperator(notifier));
}
class TakeUntilOperator {
    constructor(notifier) {
        this.notifier = notifier;
    }
    call(subscriber) {
        return new TakeUntilSubscriber(subscriber, this.notifier);
    }
}
class TakeUntilSubscriber extends OuterSubscriber {
    constructor(destination, notifier) {
        super(destination);
        this.notifier = notifier;
        this.add(subscribeToResult(this, notifier));
    }
    notifyNext(outerValue, innerValue, outerIndex, innerIndex, innerSub) {
        this.complete();
    }
    notifyComplete() {
        // noop
    }
}
//# sourceMappingURL=takeUntil.js.map
import { Subject } from '../Subject';
import { OuterSubscriber } from '../OuterSubscriber';
import { subscribeToResult } from '../util/subscribeToResult';
export function window(closingNotifier) {
    return this.lift(new WindowOperator(closingNotifier));
}
class WindowOperator {
    constructor(closingNotifier) {
        this.closingNotifier = closingNotifier;
    }
    call(subscriber) {
        return new WindowSubscriber(subscriber, this.closingNotifier);
    }
}
class WindowSubscriber extends OuterSubscriber {
    constructor(destination, closingNotifier) {
        super(destination);
        this.destination = destination;
        this.closingNotifier = closingNotifier;
        this.add(subscribeToResult(this, closingNotifier));
        this.openWindow();
    }
    notifyNext(outerValue, innerValue, outerIndex, innerIndex, innerSub) {
        this.openWindow();
    }
    notifyError(error, innerSub) {
        this._error(error);
    }
    notifyComplete(innerSub) {
        this._complete();
    }
    _next(value) {
        this.window.next(value);
    }
    _error(err) {
        this.window.error(err);
        this.destination.error(err);
    }
    _complete() {
        this.window.complete();
        this.destination.complete();
    }
    openWindow() {
        const prevWindow = this.window;
        if (prevWindow) {
            prevWindow.complete();
        }
        const destination = this.destination;
        const newWindow = this.window = new Subject();
        destination.add(newWindow);
        destination.next(newWindow);
    }
}
//# sourceMappingURL=window.js.map
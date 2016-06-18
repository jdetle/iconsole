import { Subscriber } from '../Subscriber';
import { ArgumentOutOfRangeError } from '../util/ArgumentOutOfRangeError';
import { EmptyObservable } from '../observable/EmptyObservable';
export function takeLast(total) {
    if (total === 0) {
        return new EmptyObservable();
    }
    else {
        return this.lift(new TakeLastOperator(total));
    }
}
class TakeLastOperator {
    constructor(total) {
        this.total = total;
        if (this.total < 0) {
            throw new ArgumentOutOfRangeError;
        }
    }
    call(subscriber) {
        return new TakeLastSubscriber(subscriber, this.total);
    }
}
class TakeLastSubscriber extends Subscriber {
    constructor(destination, total) {
        super(destination);
        this.total = total;
        this.count = 0;
        this.index = 0;
        this.ring = new Array(total);
    }
    _next(value) {
        let index = this.index;
        const ring = this.ring;
        const total = this.total;
        const count = this.count;
        if (total > 1) {
            if (count < total) {
                this.count = count + 1;
                this.index = index + 1;
            }
            else if (index === 0) {
                this.index = ++index;
            }
            else if (index < total) {
                this.index = index + 1;
            }
            else {
                this.index = index = 0;
            }
        }
        else if (count < total) {
            this.count = total;
        }
        ring[index] = value;
    }
    _complete() {
        let iter = -1;
        const { ring, count, total, destination } = this;
        let index = (total === 1 || count < total) ? 0 : this.index - 1;
        while (++iter < count) {
            if (iter + index === total) {
                index = total - iter;
            }
            destination.next(ring[iter + index]);
        }
        destination.complete();
    }
}
//# sourceMappingURL=takeLast.js.map
import { Observable } from '../Observable';
import { Subscriber } from '../Subscriber';
import { PromiseObservable } from './PromiseObservable';
import { EmptyObservable } from './EmptyObservable';
import { isPromise } from '../util/isPromise';
import { isArray } from '../util/isArray';
export class ForkJoinObservable extends Observable {
    constructor(sources, resultSelector) {
        super();
        this.sources = sources;
        this.resultSelector = resultSelector;
    }
    static create(...sources) {
        if (sources === null || arguments.length === 0) {
            return new EmptyObservable();
        }
        let resultSelector = null;
        if (typeof sources[sources.length - 1] === 'function') {
            resultSelector = sources.pop();
        }
        // if the first and only other argument besides the resultSelector is an array
        // assume it's been called with `forkJoin([obs1, obs2, obs3], resultSelector)`
        if (sources.length === 1 && isArray(sources[0])) {
            sources = sources[0];
        }
        if (sources.length === 0) {
            return new EmptyObservable();
        }
        return new ForkJoinObservable(sources, resultSelector);
    }
    _subscribe(subscriber) {
        const sources = this.sources;
        const len = sources.length;
        const context = { completed: 0, total: len, values: emptyArray(len), selector: this.resultSelector };
        for (let i = 0; i < len; i++) {
            let source = sources[i];
            if (isPromise(source)) {
                source = new PromiseObservable(source);
            }
            source.subscribe(new AllSubscriber(subscriber, i, context));
        }
    }
}
class AllSubscriber extends Subscriber {
    constructor(destination, index, context) {
        super(destination);
        this.index = index;
        this.context = context;
        this._value = null;
    }
    _next(value) {
        this._value = value;
    }
    _complete() {
        const destination = this.destination;
        if (this._value == null) {
            destination.complete();
        }
        const context = this.context;
        context.completed++;
        context.values[this.index] = this._value;
        const values = context.values;
        if (context.completed !== values.length) {
            return;
        }
        if (values.every(hasValue)) {
            let value = context.selector ? context.selector.apply(this, values) :
                values;
            destination.next(value);
        }
        destination.complete();
    }
}
function hasValue(x) {
    return x !== null;
}
function emptyArray(len) {
    let arr = [];
    for (let i = 0; i < len; i++) {
        arr.push(null);
    }
    return arr;
}
//# sourceMappingURL=ForkJoinObservable.js.map
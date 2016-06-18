import { Subscriber } from '../Subscriber';
import { Subscription } from '../Subscription';
import { Observable } from '../Observable';
import { Operator } from '../Operator';
import { Subject } from '../Subject';
import { Map } from '../util/Map';
import { FastMap } from '../util/FastMap';
/**
 * Groups the items emitted by an Observable according to a specified criterion,
 * and emits these grouped items as `GroupedObservables`, one `GroupedObservable` per group.
 *
 * <img src="./img/groupBy.png" width="100%">
 *
 * @param {Function} keySelector - a function that extracts the key for each item
 * @param {Function} elementSelector - a function that extracts the return element for each item
 * @returns {Observable} an Observable that emits GroupedObservables, each of which corresponds
 * to a unique key value and each of which emits those items from the source Observable that share
 * that key value.
 */
export function groupBy(keySelector, elementSelector, durationSelector) {
    return this.lift(new GroupByOperator(this, keySelector, elementSelector, durationSelector));
}
class GroupByOperator extends Operator {
    constructor(source, keySelector, elementSelector, durationSelector) {
        super();
        this.source = source;
        this.keySelector = keySelector;
        this.elementSelector = elementSelector;
        this.durationSelector = durationSelector;
    }
    call(subscriber) {
        return new GroupBySubscriber(subscriber, this.keySelector, this.elementSelector, this.durationSelector);
    }
}
class GroupBySubscriber extends Subscriber {
    constructor(destination, keySelector, elementSelector, durationSelector) {
        super();
        this.keySelector = keySelector;
        this.elementSelector = elementSelector;
        this.durationSelector = durationSelector;
        this.groups = null;
        this.attemptedToUnsubscribe = false;
        this.count = 0;
        this.destination = destination;
        this.add(destination);
    }
    _next(value) {
        let key;
        try {
            key = this.keySelector(value);
        }
        catch (err) {
            this.error(err);
            return;
        }
        this._group(value, key);
    }
    _group(value, key) {
        let groups = this.groups;
        if (!groups) {
            groups = this.groups = typeof key === 'string' ? new FastMap() : new Map();
        }
        let group = groups.get(key);
        if (!group) {
            groups.set(key, group = new Subject());
            const groupedObservable = new GroupedObservable(key, group, this);
            if (this.durationSelector) {
                this._selectDuration(key, group);
            }
            this.destination.next(groupedObservable);
        }
        if (this.elementSelector) {
            this._selectElement(value, group);
        }
        else {
            this.tryGroupNext(value, group);
        }
    }
    _selectElement(value, group) {
        let result;
        try {
            result = this.elementSelector(value);
        }
        catch (err) {
            this.error(err);
            return;
        }
        this.tryGroupNext(result, group);
    }
    _selectDuration(key, group) {
        let duration;
        try {
            duration = this.durationSelector(new GroupedObservable(key, group));
        }
        catch (err) {
            this.error(err);
            return;
        }
        this.add(duration.subscribe(new GroupDurationSubscriber(key, group, this)));
    }
    tryGroupNext(value, group) {
        if (!group.isUnsubscribed) {
            group.next(value);
        }
    }
    _error(err) {
        const groups = this.groups;
        if (groups) {
            groups.forEach((group, key) => {
                group.error(err);
            });
            groups.clear();
        }
        this.destination.error(err);
    }
    _complete() {
        const groups = this.groups;
        if (groups) {
            groups.forEach((group, key) => {
                group.complete();
            });
            groups.clear();
        }
        this.destination.complete();
    }
    removeGroup(key) {
        this.groups.delete(key);
    }
    unsubscribe() {
        if (!this.isUnsubscribed && !this.attemptedToUnsubscribe) {
            this.attemptedToUnsubscribe = true;
            if (this.count === 0) {
                super.unsubscribe();
            }
        }
    }
}
class GroupDurationSubscriber extends Subscriber {
    constructor(key, group, parent) {
        super();
        this.key = key;
        this.group = group;
        this.parent = parent;
    }
    _next(value) {
        this.tryComplete();
    }
    _error(err) {
        this.tryError(err);
    }
    _complete() {
        this.tryComplete();
    }
    tryError(err) {
        const group = this.group;
        if (!group.isUnsubscribed) {
            group.error(err);
        }
        this.parent.removeGroup(this.key);
    }
    tryComplete() {
        const group = this.group;
        if (!group.isUnsubscribed) {
            group.complete();
        }
        this.parent.removeGroup(this.key);
    }
}
export class GroupedObservable extends Observable {
    constructor(key, groupSubject, refCountSubscription) {
        super();
        this.key = key;
        this.groupSubject = groupSubject;
        this.refCountSubscription = refCountSubscription;
    }
    _subscribe(subscriber) {
        const subscription = new Subscription();
        const { refCountSubscription, groupSubject } = this;
        if (refCountSubscription && !refCountSubscription.isUnsubscribed) {
            subscription.add(new InnerRefCountSubscription(refCountSubscription));
        }
        subscription.add(groupSubject.subscribe(subscriber));
        return subscription;
    }
}
class InnerRefCountSubscription extends Subscription {
    constructor(parent) {
        super();
        this.parent = parent;
        parent.count++;
    }
    unsubscribe() {
        const parent = this.parent;
        if (!parent.isUnsubscribed && !this.isUnsubscribed) {
            super.unsubscribe();
            parent.count -= 1;
            if (parent.count === 0 && parent.attemptedToUnsubscribe) {
                parent.unsubscribe();
            }
        }
    }
}
//# sourceMappingURL=groupBy.js.map
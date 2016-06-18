import { root } from '../util/root';
import { Subscription } from '../Subscription';
export class FutureAction extends Subscription {
    constructor(scheduler, work) {
        super();
        this.scheduler = scheduler;
        this.work = work;
    }
    execute() {
        if (this.isUnsubscribed) {
            throw new Error('How did did we execute a canceled Action?');
        }
        this.work(this.state);
    }
    schedule(state, delay = 0) {
        if (this.isUnsubscribed) {
            return this;
        }
        return this._schedule(state, delay);
    }
    _schedule(state, delay = 0) {
        this.delay = delay;
        this.state = state;
        const id = this.id;
        if (id != null) {
            this.id = undefined;
            root.clearTimeout(id);
        }
        this.id = root.setTimeout(() => {
            this.id = null;
            const { scheduler } = this;
            scheduler.actions.push(this);
            scheduler.flush();
        }, delay);
        return this;
    }
    _unsubscribe() {
        const { id, scheduler } = this;
        const { actions } = scheduler;
        const index = actions.indexOf(this);
        if (id != null) {
            this.id = null;
            root.clearTimeout(id);
        }
        if (index !== -1) {
            actions.splice(index, 1);
        }
        this.work = null;
        this.state = null;
        this.scheduler = null;
    }
}
//# sourceMappingURL=FutureAction.js.map
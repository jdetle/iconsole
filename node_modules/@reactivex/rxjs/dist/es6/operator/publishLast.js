import { AsyncSubject } from '../subject/AsyncSubject';
import { multicast } from './multicast';
export function publishLast() {
    return multicast.call(this, new AsyncSubject());
}
//# sourceMappingURL=publishLast.js.map
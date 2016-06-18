import { Observable } from '../../Observable';
import { distinctUntilKeyChanged } from '../../operator/distinctUntilKeyChanged';
const observableProto = Observable.prototype;
observableProto.distinctUntilKeyChanged = distinctUntilKeyChanged;
export var _void;
//# sourceMappingURL=distinctUntilKeyChanged.js.map
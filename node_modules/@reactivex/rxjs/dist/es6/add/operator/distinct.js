import { Observable } from '../../Observable';
import { distinct } from '../../operator/distinct';
const observableProto = Observable.prototype;
observableProto.distinct = distinct;
export var _void;
//# sourceMappingURL=distinct.js.map
import { Observable } from '../../Observable';
import { exhaust } from '../../operator/exhaust';
const observableProto = Observable.prototype;
observableProto.exhaust = exhaust;
export var _void;
//# sourceMappingURL=exhaust.js.map
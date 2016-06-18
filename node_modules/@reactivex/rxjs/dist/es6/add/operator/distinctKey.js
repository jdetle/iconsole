import { Observable } from '../../Observable';
import { distinctKey } from '../../operator/distinctKey';
const observableProto = Observable.prototype;
observableProto.distinctKey = distinctKey;
export var _void;
//# sourceMappingURL=distinctKey.js.map
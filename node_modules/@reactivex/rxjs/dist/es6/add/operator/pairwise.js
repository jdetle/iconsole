import { Observable } from '../../Observable';
import { pairwise } from '../../operator/pairwise';
const observableProto = Observable.prototype;
observableProto.pairwise = pairwise;
export var _void;
//# sourceMappingURL=pairwise.js.map
import { Observable } from '../../Observable';
import { exhaustMap } from '../../operator/exhaustMap';
const observableProto = Observable.prototype;
observableProto.exhaustMap = exhaustMap;
export var _void;
//# sourceMappingURL=exhaustMap.js.map
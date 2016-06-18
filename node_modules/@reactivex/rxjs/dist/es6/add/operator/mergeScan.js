import { Observable } from '../../Observable';
import { mergeScan } from '../../operator/mergeScan';
const observableProto = Observable.prototype;
observableProto.mergeScan = mergeScan;
export var _void;
//# sourceMappingURL=mergeScan.js.map
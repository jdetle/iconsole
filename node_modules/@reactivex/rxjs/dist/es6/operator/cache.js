import { publishReplay } from './publishReplay';
export function cache(bufferSize = Number.POSITIVE_INFINITY, windowTime = Number.POSITIVE_INFINITY, scheduler) {
    return publishReplay.call(this, bufferSize, windowTime, scheduler).refCount();
}
//# sourceMappingURL=cache.js.map
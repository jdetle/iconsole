import { ZipOperator } from './zip';
export function zipAll(project) {
    return this.lift(new ZipOperator(project));
}
//# sourceMappingURL=zipAll.js.map
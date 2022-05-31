export type Resolver<T> = (value: T) => void;
export type Rejecter = (reason: any) => void;

export default class PromiseObserver<T> {
  public readonly reject: Rejecter;
  public readonly resolve: Resolver<T>;
  public readonly promise: Promise<T>;
  constructor(promise: Promise<T>, resolve: Resolver<T>, reject: Rejecter) {
    this.promise = promise;
    this.resolve = resolve;
    this.reject = reject;
  }
}

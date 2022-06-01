export type Resolver<T> = (value: T) => void;
export type Rejecter = (reason: any) => void;

export interface RefWrapper<T> {
  promise?: Promise<T>;
}

export default class PromiseObserver<T> {
  public readonly reject: Rejecter;
  public readonly resolve: Resolver<T>;
  private readonly ref: RefWrapper<T>;

  constructor(ref: RefWrapper<T>, resolve: Resolver<T>, reject: Rejecter) {
    this.ref = ref;
    this.resolve = resolve;
    this.reject = reject;
  }

  compare(promise: Promise<T>) {
    return this.ref.promise === promise;
  }
}

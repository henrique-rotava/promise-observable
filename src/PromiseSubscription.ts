import PromiseObservable from "./PromiseObservable";

export default class PromiseSubscription<T> {
  private readonly _value: Promise<T>;
  private promisable: PromiseObservable<T>;

  constructor(promise: Promise<T>, promisable: PromiseObservable<T>) {
    this._value = promise;
    this.promisable = promisable;
  }

  public async value(): Promise<T> {
    return this._value;
  }

  public unsubscribe(): void {
    this.promisable.unsubscribe(this);
  }
}

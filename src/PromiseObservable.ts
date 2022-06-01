import PromiseObserver, { RefWrapper } from "./PromiseObserver";
import PromiseSubscription from "./PromiseSubscription";

export default class PromiseObservable<T> {
  private subscribers: Array<PromiseObserver<T>>;

  private value?: T;
  private reason: any;

  private resolved: boolean = false;
  private rejected: boolean = false;

  constructor() {
    this.subscribers = [];
  }

  private createPromise(timeout?: number) {
    let promise: Promise<T>;
    const refWrapper: RefWrapper<T> = {};

    if (this.resolved && this.value !== undefined) {
      promise = Promise.resolve(this.value);
    } else if (this.rejected) {
      promise = Promise.reject(this.reason);
    } else {
      promise = new Promise<T>((resolve, reject) => {
        const subscriber = new PromiseObserver(refWrapper, resolve, reject);
        if (timeout) setTimeout(() => reject(new Error("expired")), timeout);
        this.subscribers.push(subscriber);
      });
      refWrapper.promise = promise;
    }
    return promise;
  }

  private removeAllSubscribers(): void {
    this.subscribers = [];
  }

  public subscribe(): PromiseSubscription<T> {
    const promise = this.createPromise();
    return new PromiseSubscription<T>(promise, this);
  }

  /**
   * Will subscribe until an amount of time, then it will be rejected if not resolved previoulsy
   * @param timeout expiring time
   * @returns a subscription
   */
  public subscribeUntil(timeout: number): PromiseSubscription<T> {
    const promise = this.createPromise(timeout);
    return new PromiseSubscription<T>(promise, this);
  }

  public unsubscribe(subject: PromiseSubscription<T>) {
    this.subscribers = this.subscribers.filter(
      (subscriber) => !subscriber.compare(subject.value())
    );
  }

  public resolve(value: T): void {
    this.value = value;
    this.resolved = true;
    this.subscribers.forEach((observer) => observer.resolve(value));
    this.removeAllSubscribers();
  }

  public reject(reason?: any): void {
    this.reason = reason;
    this.rejected = true;
    this.subscribers.forEach((observer) => observer.reject(reason));
    this.removeAllSubscribers();
  }
}

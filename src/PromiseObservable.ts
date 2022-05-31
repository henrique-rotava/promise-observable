import PromiseObserver from "./PromiseObserver";
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
    if (this.resolved && this.value !== undefined) {
      promise = Promise.resolve(this.value);
    } else if (this.rejected) {
      promise = Promise.reject(this.reason);
    } else {
      promise = new Promise<T>((resolve, reject) => {
        const subscriber = new PromiseObserver(promise, resolve, reject);
        if (timeout) setTimeout(() => reject(new Error("expired")), timeout);
        this.subscribers.push(subscriber);
      });
    }
    return promise;
  }

  private removeAllSubscribers(): void {
    this.subscribers = [];
  }

  public subscribe(): PromiseSubscription<T> {
    const promise = this.createPromise();
    const subject = new PromiseSubscription<T>(promise, this);
    return subject;
  }

  public subscribeUntil(timeout: number): PromiseSubscription<T> {
    const promise = this.createPromise(timeout);
    const subject = new PromiseSubscription<T>(promise, this);
    return subject;
  }

  public unsubscribe(subject: PromiseSubscription<T>) {
    this.subscribers = this.subscribers.filter(
      (subscriber) => subject.value() !== subscriber.promise
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

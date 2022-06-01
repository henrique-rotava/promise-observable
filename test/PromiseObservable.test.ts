import PromiseObservable from "../src/PromiseObservable";

const awaiter = (time: number) =>
  new Promise((resolve) => setTimeout(resolve, time));

test("must resolve value for subscribers", async () => {
  const observer = new PromiseObservable<String>();

  setTimeout(() => {
    observer.resolve("hello!");
  }, 300);

  const subscription1 = observer.subscribe();
  const subscription2 = observer.subscribe();

  const value1 = await subscription1.value();
  const value2 = await subscription2.value();

  expect(value1).toEqual("hello!");
  expect(value2).toEqual("hello!");
});

test("must reject subscribers", async () => {
  const observer = new PromiseObservable<String>();

  setTimeout(() => {
    observer.reject("Impossible to proceed");
  }, 300);

  const subscription1 = observer.subscribe();
  const subscription2 = observer.subscribe();

  try {
    const value1 = await subscription1.value();
  } catch (e) {
    expect(e).toMatch("Impossible to proceed");
  }

  try {
    const value2 = await subscription2.value();
  } catch (e) {
    expect(e).toMatch("Impossible to proceed");
  }
});

test("must give up awaiting after timeout", async () => {
  const observer = new PromiseObservable<Number>();
  setTimeout(() => {
    observer.resolve(404);
  }, 300);

  const subscription = observer.subscribeUntil(150);

  try {
    await subscription.value();
  } catch (e) {
    const message = (e as Error).message;
    expect(message).toMatch("expired");
  }
});

test("must not be notified if unsubscribe", async () => {
  const observer = new PromiseObservable<String>();

  setTimeout(() => {
    observer.resolve("notified!");
  }, 200);

  const subscription1 = observer.subscribe();
  const subscription2 = observer.subscribe();

  setTimeout(() => {
    subscription2.unsubscribe();
  }, 100);

  const value1 = await subscription1.value();
  const resolver = jest.fn(() => {});
  subscription2.value().then(resolver /*(value) => (value2 = value)*/);

  expect(value1).toEqual("notified!");
  await awaiter(250);
  expect(resolver).not.toBeCalled();
});

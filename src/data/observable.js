export const subscribe = subscriber => observable =>
  observable.subscribe(subscriber)

const isSubscriber = subscriber =>
  typeof subscriber === "function" || typeof subscriber.next === "function"

const toFullSubscriber = subscriber => {
  if (!isSubscriber(subscriber)) {
    throw new Error(`
      A subscriber should be a function or an object 
      that has a method called next
    `)
  }

  const noop = () => {
    /* no-op */
  }

  return {
    next: typeof subscriber === "function" ? subscriber : subscriber.next,
    error: subscriber.error || noop,
    done: subscriber.done || noop,
  }
}

export const Observable = producer => ({
  subscribe: subscriber => producer(toFullSubscriber(subscriber)),
})

export const Subject = () => {
  let subscribers = []

  return {
    subscribe: subscriber => {
      subscribers.push(toFullSubscriber(subscriber))

      return () => {
        subscribers = subscribers.filter(sub => sub !== subscriber)
      }
    },
    next: value => subscribers.forEach(subscriber => subscriber.next(value)),
    error: error => subscribers.forEach(subscriber => subscriber.error(error)),
    done: value => subscribers.forEach(subscriber => subscriber.done(value)),
  }
}

export const of = (...values) =>
  Observable(subscriber => {
    for (const value of values) {
      subscriber.next(value)
    }
    subscriber.done()
  })

import { Subject } from "../data/observable.js"

export const observable = Subject()

let works = []

export const save = work => {
  works.push(work)

  observable.next(works)
}

export const remove = work => {
  works = works.filter(w => w !== work)

  observable.next(works)
}

export const getWorks = () => observable

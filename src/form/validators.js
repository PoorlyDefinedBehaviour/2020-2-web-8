import * as either from "../data/either.js"
import { partition } from "../utils/partition.js"

const isEmpty = value => value === null || value === undefined || value === ""

// compose :: [(a) -> Either String a] -> a -> Either String a
export const compose = (...validators) => value => {
  for (const validator of validators.slice().reverse()) {
    const result = validator(value)
    if (either.isLeft(result)) {
      return result
    }
  }

  return either.Right(value)
}

// required :: String -> a -> Either String a
export const required = message => value => {
  return isEmpty(value) ? either.Left(message) : either.Right(value)
}

// minLength :: Int -> String -> a -> Either String a
export const minLength = (length, message) => value => {
  if (isEmpty(value)) {
    return either.Right()
  }

  return value.length >= length ? either.Right(value) : either.Left(message)
}

// lessThan :: Number -> a -> Either String a
export const lessThan = (target, message) => value => {
  if (isEmpty(value)) {
    return either.Right()
  }

  if (Number(value) > target) {
    return either.Left(message)
  }

  return either.Right(value)
}

// integer :: String -> a -> Either String a
export const integer = message => value => {
  if (isEmpty(value)) {
    return either.Right()
  }

  if (!Number.isInteger(parseInt(value, 10))) {
    return either.Left(message)
  }

  return either.Right()
}

// value :: () -> a -> Either String a
export const valueField = () => either.Right

// collect : [Either(Error | String)] -> Either([Error | String])
export const collect = list => {
  const [errors] = partition(either.isLeft, list)
  return errors.map(error => error.value)
}

const getFormValues = validations =>
  Object.fromEntries(
    Object.keys(validations).map(field => [
      field,
      document.querySelector(`#${field}`).value,
    ])
  )

export const validate = async validations => {
  const values = getFormValues(validations)

  const results = Object.entries(values)
    .map(([field, value]) => [field, value, validations[field](value, values)])
    .map(([field, value, result]) =>
      either.mapLeft(message => ({ field, value, message }), result)
    )

  const errors = collect(results)

  return errors.length === 0 ? either.Right(values) : either.Left(errors)
}

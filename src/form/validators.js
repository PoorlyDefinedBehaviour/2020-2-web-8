import * as either from "../data/either.js"
import { partition } from "../utils/partition.js"

// required :: String -> a -> Either String a
export const required = message => value =>
  value ? either.Right(value) : either.Left(message)

// minLength :: Int -> String -> a -> Either String a
export const minLength = (length, message) => value =>
  value.length >= length ? either.Right(value) : either.Left(message)

// yearInThePast :: String -> a -> Either String a
export const yearInThePast = message => value => {
  if (String(value).length !== 4) {
    return either.Left(message)
  }

  if (!Number.isInteger(parseInt(value, 10))) {
    return either.Left(message)
  }

  if (parseInt(value, 10) > new Date().getFullYear()) {
    return either.Left(message)
  }

  return either.Right(value)
}

// value :: () -> a -> Either String a
export const value = () => either.Right

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

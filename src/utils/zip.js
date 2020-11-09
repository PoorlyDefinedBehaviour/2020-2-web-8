// zip :: [a] -> [b] -> [[a, b]]
export const zip = (xs, ys) =>
  xs.length < ys.length
    ? xs.map((x, index) => [x, ys[index]])
    : ys.map((y, index) => [xs[index], y])

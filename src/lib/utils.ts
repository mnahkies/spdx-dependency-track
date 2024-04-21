export function isDefined<T>(it: T | undefined): it is T {
  return it !== undefined
}

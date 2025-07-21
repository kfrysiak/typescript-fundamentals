import { Result } from './result';

export const None = Symbol('None');
export type None = typeof None;

export const success = <const T>(value?: T) => [value as T, undefined] as const;

/**
 * Utility type that returns only success variant from a Result. You can pass a promise of
 * a Result as well.
 */
export type SuccessOf<T extends Result<U> | Promise<Result<U>>, U = unknown> =
  T extends Promise<Result<infer Success>>
    ? Exclude<Success, None>
    : T extends Result<infer Success>
      ? Exclude<Success, None>
      : never;

/**
 * Returns just success of a result, throws otherwise. Use only in tests and
 * throwaway scripts
 **/
export function successOf<T extends Result<any, any>>(result: T) {
  if (result[1]) {
    throw new Error('Trying to get successOf a failure');
  }
  return result[0] as SuccessOf<T>;
}

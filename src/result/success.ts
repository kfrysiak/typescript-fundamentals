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

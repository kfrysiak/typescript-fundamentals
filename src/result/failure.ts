import { ErrorWithPayload } from './error';
import { Result } from './result';
import { None } from './success';

export type Failure<Code extends string = string, Payload = undefined> = {
  readonly code: Code;
  readonly message: string;
} & (Payload extends undefined ? unknown : { readonly payload: Payload });

type FailureInput<Code extends string = string, Payload = undefined> = {
  code: Code;
  message: string;
  payload?: Payload;
};
export const failure = <
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Input extends FailureInput | Failure<string, any>,
>(
  input: Input,
) =>
  [
    undefined as unknown as None,
    {
      code: input.code,
      message: input.message,
      ...((input as FailureInput).payload !== undefined
        ? { payload: (input as FailureInput).payload }
        : {}),
    },
  ] as unknown as readonly [
    None,
    typeof input extends Failure
      ? typeof input
      : typeof input extends FailureInput<
            infer FailureCode,
            infer FailurePayload
          >
        ? Failure<FailureCode, FailurePayload>
        : 'Error', // Error
  ]; // If input is already a failure, return it as is

/**
 * Utility type that returns only failure variant from a Result. You can pass a promise of
 * a Result as well.
 */
export type FailureOf<
  T extends Result<U> | Promise<Result<U, F>>,
  U = unknown,
  F = unknown,
> =
  T extends Promise<Result<U, infer Failure>>
    ? Exclude<Failure, typeof undefined>
    : T extends Result<U, infer Failure>
      ? Exclude<Failure, typeof undefined>
      : never;

export class ResultError extends Error {}

/**
 * Returns just failure of a result, throws otherwise. Use only in tests and
 * throwaway scripts
 **/
export function failureOf<T extends Result<any, any>>(result: T) {
  if (!result[1]) {
    throw new Error('Trying to get failureOf a success');
  }
  return result[1] as FailureOf<T>;
}

/**
 * Pass potential failure here to narrow down result to success, or throw. Not a
 * recommended way of handling results
 */
export function assertNonFailure(
  failureResult: undefined | Failure<string> | Failure<string, unknown>,
): asserts failureResult is undefined {
  if (typeof failureResult !== 'undefined') {
    if ('payload' in failureResult) {
      throw new ErrorWithPayload(
        `Asserted success but got a failure: '${failureResult.code}'`,
        failureResult.payload,
      );
    } else {
      throw new Error(
        `Asserted success but got a failure: '${failureResult.code}'`,
      );
    }
  }
}

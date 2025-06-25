import { ErrorWithPayload } from './error';
import { Result } from './result';
import { None } from './success';

export type Failure<Code extends string = string, Payload = undefined> = {
  readonly code: Code;
  readonly message: string;
} & (Payload extends undefined ? unknown : { readonly payload: Payload });

type FailureInput<Code extends string, Payload> = {
  code: Code;
  message: string;
  payload?: Payload;
};
export const failure = <const Code extends string, const Payload>(
  input: FailureInput<Code, Payload>,
) =>
  [
    undefined as unknown as None,
    {
      code: input.code,
      message: input.message,
      ...(input.payload !== undefined && { payload: input.payload }),
    },
  ] as [
    None,
    typeof input extends FailureInput<infer Code, infer Payload>
      ? Failure<Code, Payload>
      : typeof input extends Failure<infer FailureCode, infer FailurePayload>
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
 * Pass potential failure here to narrow down result to success, or throw. Not a
 * recommended way of handling results
 */
export function assertNonFailure(
  failureResult: undefined | Failure<string>,
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

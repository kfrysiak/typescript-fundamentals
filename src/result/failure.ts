import { expectTypeOf } from 'vitest';
import { ErrorWithPayload } from './error';
import { Result } from './result';
import { None } from './success';
import { Prettify } from './typescript';

export type Failure<
  Code extends string = string,
  Payload = any,
  Message extends string = string,
> = Payload extends undefined
  ? FailureWithoutPayload<Code, Message>
  : FailureWithPayload<Code, Message, Payload>;

export type PrefixString<
  Input extends string,
  Prefix extends string,
> = `${Prefix}_${Input}`;

export type PrefixFailure<
  Input extends Failure,
  PrefixType extends string | undefined = undefined,
> = PrefixType extends string
  ? Input extends FailureWithPayload<infer Code, infer Payload, infer Message>
    ? FailureWithPayload<PrefixString<Code, PrefixType>, Payload, Message>
    : Input extends FailureWithoutPayload<infer Code, infer Message>
      ? Omit<
          FailureWithoutPayload<PrefixString<Code, PrefixType>, Message>,
          'payload'
        >
      : never
  : never;

type FailureInput<Code extends string = string, Payload = undefined> = {
  code: Code;
  message: string;
  payload?: Payload;
};

export function failure<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Input extends FailureWithoutPayload<string>,
>(input: Input): readonly [None, Input];
export function failure<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Input extends FailureWithPayload<string>,
>(input: Input): readonly [None, Input];
export function failure<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Input extends Failure,
  const Prefix extends string,
>(
  input: Input,
  prefix: Prefix,
): readonly [None, Prettify<PrefixFailure<Input, Prefix>>];
export function failure<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Input extends FailureWithPayload | FailureWithoutPayload,
  const Prefix extends string | undefined,
>(input: Input, prefix?: Prefix) {
  return [
    undefined as unknown as None,
    {
      code: prefix ? `${prefix}_${input.code}` : `${input.code}`,
      message: input.message,
      ...((input as FailureInput).payload !== undefined
        ? { payload: (input as FailureInput).payload }
        : {}),
    },
  ] as any;
}

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

/**
 * Use this type if you want to check if a given type is a Failure
 */
type FailureWithPayload<
  Code extends string = string,
  Message extends string = string,
  Payload = any,
> = {
  readonly code: Code;
  readonly message: Message;
  readonly payload: Payload;
};

type FailureWithoutPayload<
  Code extends string = string,
  Message extends string = string,
> = {
  readonly code: Code;
  readonly message: Message;
  payload?: never;
};

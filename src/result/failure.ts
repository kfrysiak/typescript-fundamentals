import { expectTypeOf } from 'vitest';
import { ErrorWithPayload } from './error';
import { Result } from './result';
import { None } from './success';
import { Which } from './typescript';

export type Failure<
  Code extends string = string,
  Payload = undefined,
  Message = string,
> = Payload extends undefined
  ? {
      readonly code: Code;
      readonly message: Message;
    }
  : {
      readonly code: Code;
      readonly message: Message;
      readonly payload: Payload;
    };
// export type Failure<Code extends string = string, Payload = undefined> = {
//   readonly code: Code;
//   readonly message: string;
//   // eslint-disable-next-line @typescript-eslint/no-empty-object-type
// } & (Payload extends undefined ? {} : { readonly payload: Payload });

export type PrefixString<
  Input extends string,
  Prefix extends string,
> = `${Prefix}_${Input}`;

export type PrefixFailure<
  Input extends Failure,
  PrefixType extends string | undefined = undefined,
> = PrefixType extends string
  ? Input extends Failure<infer Code, infer Payload, infer Message>
    ? Failure<PrefixString<Code, PrefixType>, Payload, Message>
    : 'not a failure'
  : never;

type FailureInput<Code extends string = string, Payload = undefined> = {
  code: Code;
  message: string;
  payload?: Payload;
};

/**
 * Validate Failure vs FailureInput recognition
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const realFailure = failure({ code: 'test', message: 'Hello' });
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const failureInput = { code: 'test', message: 'Hello' };
type RealFailure = FailureOf<typeof realFailure>;
type FailureInputType = typeof failureInput;
expectTypeOf<Which<RealFailure>>().toEqualTypeOf<'Failure'>();
expectTypeOf<Which<FailureInputType>>().toEqualTypeOf<'FailureInput'>();
type W1 = Which<RealFailure>; // "FailureInput"
type W2 = Which<FailureInputType>; // "FailureInput"

export function failure<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Input extends FailureInput | Failure<string, any>,
>(
  input: Input,
): readonly [
  None,
  Input extends Failure<infer Code, infer Payload>
    ? Input
    : typeof input extends FailureInput<infer FailureCode, infer FailurePayload>
      ? Failure<FailureCode, FailurePayload>
      : 'Error',
];
export function failure<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Input extends FailureInput | Failure<string, any>,
  const Prefix extends string,
>(
  input: Input,
  prefix: Prefix,
): readonly [
  None,
  Input extends Failure<infer Code, infer Payload>
    ? PrefixFailure<Input, Prefix>
    : typeof input extends FailureInput<infer FailureCode, infer FailurePayload>
      ? Failure<PrefixString<FailureCode, Prefix>, FailurePayload>
      : 'Error',
];
export function failure<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Input extends FailureInput | Failure<string, any>,
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
} // If input is already a failure, return it as is

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

type testF = Failure<'hello'>;
type testPayload = Failure<'hello', { id: 5 }>;
/**
 * Use this type if you want to check if a given type is a Failure
 */
type FailureWithPayload<
  Code extends string = string,
  Message extends string = string,
  Payload = any,
> = {
  code: Code;
  message: Message;
  payload: Payload;
};

type FailureWithoutPayload<
  Code extends string = string,
  Message extends string = string,
> = {
  code: Code;
  message: Message;
};

const [, testFailure] = failure({ code: 'hello', message: 'hey' });
const [, testFailureWithP] = failure({
  code: 'hello',
  message: 'hey',
  payload: { id: 5 },
});
type S = typeof testFailure;
type T = S extends Failure ? PrefixFailure<S, 'vendor'> : 'false';
type Text = PrefixString<'something', 'vendor'>;
type Text2 = PrefixString<'something', string>;

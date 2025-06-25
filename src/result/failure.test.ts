import { describe, expectTypeOf, test } from 'vitest';
import { success } from './success';
import { assertNonFailure, Failure, failure, FailureOf } from './failure';

type Exact<T, U, True = true, False = false> = T extends U
  ? U extends T
    ? True
    : False
  : False;

type Prettify<T> = { [K in keyof T]: T[K] } & {};

describe('FailureOf', () => {
  test('returns valid failure from Result', () => {
    function withPayload() {
      if (true as any) {
        return failure({
          code: 'something_wrong',
          message: 'Something went wrong',
          payload: { id: 5 as number },
        });
      }
      return success(true);
    }

    const withPayloadResult = withPayload();
    const [res, failureResult] = withPayloadResult;

    if (!failureResult) {
      throw new Error('Should not happen');
    }
    // expectTypeOf(failureResult).toExtend<Failure>()

    type Match = {
      readonly code: 'something_wrong';
      readonly message: string;
      readonly payload: {
        readonly id: number;
      };
    };
    type ToTest = Prettify<typeof failureResult>;
    expectTypeOf<ToTest>().toEqualTypeOf<Match>();
    type JustFailure = FailureOf<typeof withPayloadResult>;
    expectTypeOf(failureResult).toEqualTypeOf<JustFailure>();
  });
});

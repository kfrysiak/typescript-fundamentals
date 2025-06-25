import { describe, expectTypeOf, test } from 'vitest';
import { success } from './success';
import { failure, FailureOf } from './failure';
import { collapseResults } from './utils';

type Exact<T, U, True = true, False = false> = T extends U
  ? U extends T
    ? True
    : False
  : False;

type Prettify<T> = { [K in keyof T]: T[K] } & {};

describe('FailureOf', () => {
  test('returns valid failure from Result', async () => {
    async function withoutPayload() {
      if (true as any) {
        const result = failure({
          code: 'something_else_went_wrong',
          message: 'Something else went wrong',
        });
        return result;
      }
      return success(true);
    }
    async function withPayload() {
      if (true as any) {
        const result = failure({
          code: 'something_wrong',
          message: 'Something went wrong',
          payload: { id: 5 },
        });
        return result;
      }
      return success('payload');
    }

    const withoutPayloadResult = await withoutPayload();
    const withPayloadResult = await withPayload();
    const [res, failureResult] = withPayloadResult;

    if (!failureResult) {
      throw new Error('Should not happen');
    }
    // expectTypeOf(failureResult).toExtend<Failure>()

    type Match = {
      readonly code: 'something_wrong';
      readonly message: string;
      readonly payload: {
        id: number;
      };
    };
    const promises = [withoutPayload(), withPayload()];
    const promiseResult = await Promise.allSettled(promises);
    const [collapseSuccess, collapseError] = collapseResults(promiseResult);
    if (collapseError) {
      type ErrorCodes = (typeof collapseError)['payload'][number]['code'];
      expectTypeOf<ErrorCodes>().toEqualTypeOf<
        'something_else_went_wrong' | 'unknown_error' | 'something_wrong'
      >();
    }
    type ToTest = Prettify<typeof failureResult>;
    expectTypeOf<ToTest>().toEqualTypeOf<Match>();
    type JustFailure = FailureOf<typeof withPayloadResult>;
    expectTypeOf(failureResult).toEqualTypeOf<JustFailure>();
  });
});

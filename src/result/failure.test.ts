import { describe, expect, expectTypeOf, test } from 'vitest';
import { success } from './success';
import { failure, FailureOf } from './failure';
import { collapseResults } from './utils';
import { Prettify } from './typescript';

describe('FailureOf', () => {
  async function mockWithoutPayload() {
    if (true as any) {
      const result = failure({
        code: 'without_payload_code',
        message: 'Without payload message',
      });
      return result;
    }
    return success(true);
  }
  async function mockWithPayload() {
    if (true as any) {
      const result = failure({
        code: 'with_payload_code',
        message: 'With payload message',
        payload: { id: 5 },
      });
      return result;
    }
    return success('payload');
  }

  /**
   * Actually returns a payload
   */
  async function mockMixed() {
    if (<any>false) {
      return mockWithoutPayload();
    }
    return mockWithPayload();
  }

  test('returns valid failure from Result', async () => {
    /**
     * Arrange
     */
    const withoutPayloadResult = await mockWithoutPayload();
    const [, withoutPayload] = withoutPayloadResult;
    const withPayloadResult = await mockWithPayload();
    const [, withPayload] = withPayloadResult;

    if (!withPayload) {
      throw new Error('Should not happen');
    }
    if (!withoutPayload) {
      throw new Error('Should not happen');
    }
    /**
     * Assert
     */
    expectTypeOf<typeof withoutPayload>().not.toHaveProperty('payload');
    expectTypeOf<typeof withPayload>().toExtend<{
      payload: {
        id: 5;
      };
    }>();

    // Exact type match
    type Match = {
      readonly code: 'with_payload_code';
      readonly message: 'With payload message';
      readonly payload: {
        readonly id: 5;
      };
    };

    type ToTest = Prettify<typeof withPayload>;
    expectTypeOf<ToTest>().toEqualTypeOf<Match>();

    // FailureOf works
    type JustFailure = FailureOf<typeof withPayloadResult>;
    expectTypeOf(withPayload).toEqualTypeOf<JustFailure>();
  });
  test('collapseResults - promises', async () => {
    const promises = [mockWithoutPayload(), mockWithPayload()];
    const promiseResult = await Promise.allSettled(promises);
    const [, collapseError] = collapseResults(promiseResult);
    if (collapseError) {
      type ErrorCodes = (typeof collapseError)['payload'][number]['code'];
      expectTypeOf<ErrorCodes>().toEqualTypeOf<
        'without_payload_code' | 'unknown_error' | 'with_payload_code'
      >();
    }
  });
  test('prefix works', async () => {
    /**
     * Arrange
     */
    const [, multipleFailures] = await mockMixed();
    if (!multipleFailures) {
      throw new Error('Should not happen');
    }
    const [, immediatelyPrefixed] = failure(
      {
        code: 'account_not_found',
        message: 'Vendor account not found',
      },
      'vendor',
    );
    /**
     * Act
     */
    const [, prefixedMultipleFailures] = failure(multipleFailures, 'vendor');

    /**
     * Assert
     */

    // Verify code union
    expectTypeOf<(typeof prefixedMultipleFailures)['code']>().toExtend<
      'vendor_with_payload_code' | 'vendor_without_payload_code'
    >();
    expect(prefixedMultipleFailures.code).toEqual('vendor_with_payload_code');

    // Verify payload
    if (prefixedMultipleFailures.code === 'vendor_with_payload_code') {
      expectTypeOf<typeof prefixedMultipleFailures>().toExtend<{
        payload: {
          id: 5;
        };
      }>();
      expect(prefixedMultipleFailures.payload).toMatchObject({
        id: 5,
      });
    }
    // Verify lack of payload
    if (prefixedMultipleFailures.code === 'vendor_without_payload_code') {
      type Test = typeof prefixedMultipleFailures;
      expectTypeOf<typeof prefixedMultipleFailures>().not.toHaveProperty(
        'payload',
      );
      expect(prefixedMultipleFailures).not.toHaveProperty('payload');
    }

    expect(immediatelyPrefixed).toMatchObject({
      code: 'vendor_account_not_found',
      message: 'Vendor account not found',
    });

    expectTypeOf<
      (typeof immediatelyPrefixed)['code']
    >().toEqualTypeOf<'vendor_account_not_found'>();
  });
});

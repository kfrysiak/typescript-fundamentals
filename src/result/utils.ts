import { failure, Failure } from './failure';
import { Result } from './result';
import { None, success } from './success';

/**
 * Collapses an array of PromiseSettledResult or Result into a single Result, returning
 * all successful values as success(array) and all failures as a single failure, with all
 * failures aggregated to its payload
 * TODO: add handle array
 */
export function collapseResults<
  PromiseResult extends Result<S, F>,
  S,
  F extends Failure,
>(promiseResults: PromiseSettledResult<PromiseResult>[]) {
  type SuccessValue =
    PromiseResult extends Result<infer S, unknown> ? S : never;
  type FailureValue =
    PromiseResult extends Result<unknown, infer F>
      ? Exclude<F, undefined>
      : never;
  const payloads: Failure[] = [];
  const values: SuccessValue[] = [];
  const unknownErrorBase = {
    code: 'unknown_error',
    message: 'An unknown error occurred',
  } as const;

  for (const promiseResult of promiseResults) {
    if (promiseResult.status === 'rejected') {
      const unknownError = {
        ...unknownErrorBase,
        payload: { reason: promiseResult.reason },
      } as const;
      payloads.push(unknownError);
      continue;
    }
    const [result, promiseFailure] = promiseResult.value;
    if (promiseFailure) {
      payloads.push(promiseFailure);
      continue;
    }
    values.push(result as SuccessValue);
  }
  if (payloads.length > 0) {
    return failure({
      code: 'collapsed_errors',
      message: 'Multiple errors occurred',
      payload: payloads as Array<
        | (typeof unknownErrorBase & { payload: { reason: unknown } })
        | FailureValue
      >,
    });
  }
  return success(values as Exclude<SuccessValue, None>[]);
}

export function findFailure<T, F>(results: Result<T, F>[]) {
  const found = results.find((result) => result[1] !== undefined);
  if (!found) {
    return undefined;
  }
  return found[1];
}

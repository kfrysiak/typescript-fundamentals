import { Failure } from './failure';
import { None } from './success';

export type FailureResult<F = Failure> = readonly [None, F];
export type SuccessResult<T> = readonly [T, undefined];

export type Result<T, F = Failure<string, undefined>> =
  | readonly [T, undefined]
  | readonly [None, F];

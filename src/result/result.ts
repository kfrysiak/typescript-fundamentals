import { Failure } from './failure';
import { None } from './success';

export type Result<T, F = Failure<string, undefined>> =
  | readonly [T, undefined]
  | readonly [None, F];

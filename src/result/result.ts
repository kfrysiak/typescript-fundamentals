import { Failure } from "./failure";
import { None } from "./success";

export type Result<T, F = Failure<string, undefined>> =
  | [T, undefined]
  | [None, F];
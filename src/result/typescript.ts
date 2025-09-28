export type ReadonlyKeys<T> = {
  [K in keyof T]-?: IfEquals<
    { [P in K]: T[P] }, // original
    { -readonly [P in K]: T[P] }, // same but without readonly
    never,
    K
  >;
}[keyof T];

export type IfEquals<X, Y, A = X, B = never> =
  (<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y ? 1 : 2 ? A : B;
export type IsReadonly<T> = ReadonlyKeys<T> extends never ? false : true;
export type Which<T> = IsReadonly<T> extends true ? 'Failure' : 'FailureInput';

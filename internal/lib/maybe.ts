// See. https://github.com/option-t/option-t/blob/v38.0.3/packages/option-t/src/maybe/maybe.ts
export type NotNullOrUndefined<T> = T extends null | undefined ? never : T;

export type Maybe<T> = T | null | undefined;

export function expect<T>(input: Maybe<T>, msg: string): NotNullOrUndefined<T> {
  if (isNotNullOrUndefined(input)) {
    return input;
  }

  throw new Error(msg);
}

function isNotNullOrUndefined<T>(
  input: Maybe<T>
): input is NotNullOrUndefined<T> {
  return input !== undefined && input !== null;
}

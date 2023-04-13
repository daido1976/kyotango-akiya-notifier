// Inspired Kotlin std lib & Zod.
// NOTE: 必要になったら Result<T, E> にして失敗時の型を { success: false; err: E }; にする
export type Result<T> = { success: true; value: T } | { success: false };

export function success<T>(value: T): Result<T> {
  return { success: true, value };
}

export function failure<T>(): Result<T> {
  return { success: false };
}

export function map<T, U>(result: Result<T>, fn: (value: T) => U): Result<U> {
  return result.success ? success(fn(result.value)) : failure();
}

// NOTE: alias of `match`
export function fold<T, U>(
  result: Result<T>,
  onSuccess: (value: T) => U,
  onFailure: () => U
): U {
  return result.success ? onSuccess(result.value) : onFailure();
}

export function getOrThrow<T>(result: Result<T>, onFailure?: () => never) {
  if (result.success) {
    return result.value;
  }

  if (onFailure) {
    return onFailure();
  } else {
    throw new Error("called `unwrapOrThrow` on failure");
  }
}

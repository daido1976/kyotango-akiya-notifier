export function difference<T extends string | number>(a: T[], b: T[]): T[] {
  return a.filter((x) => !new Set(b).has(x));
}

export function getArrayChanges<T extends string | number>(
  oldArray: T[],
  newArray: T[]
): {
  added: T[];
  removed: T[];
  changed: boolean;
} {
  const added = difference(newArray, oldArray);
  const removed = difference(oldArray, newArray);
  const changed = added.length > 0 || removed.length > 0;

  return { added, removed, changed };
}

// NOTE: 必要になったら Result<T, E> にして失敗時の型を { success: false; err: E }; にする
export type Result<T> = { success: true; value: T } | { success: false };

// TODO: success/failure みたいな関数作る

export function unwrapOrThrow<T>(result: Result<T>, onFailure?: () => never) {
  if (result.success) {
    return result.value;
  }

  if (onFailure) {
    return onFailure();
  } else {
    throw new Error("called `unwrapOrThrow` on failure");
  }
}

export function exitOnSuccess(message?: string): never {
  if (message) {
    exitWithLog(message, "log");
  } else {
    exit();
  }
}

export function exitOnFailure(message: string): never {
  exitWithLog(message, "error");
}

function exitWithLog(message: string, logType: "log" | "error"): never {
  if (logType === "log") {
    console.log(message);
    exit();
  } else {
    console.error(message);
    exit(1);
  }
}

function exit(code = 0): never {
  Deno.exit(code);
}

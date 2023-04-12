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

export async function unwrapOrThrowAsync<T>(
  operation: () => Promise<T>,
  onNullish: () => never
): Promise<NonNullable<Awaited<T>>> {
  const result = await operation();
  if (result == null) {
    onNullish();
  }
  return result;
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

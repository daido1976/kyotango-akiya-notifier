export function difference<T extends string | number>(a: T[], b: T[]): T[] {
  return a.filter((x) => !new Set(b).has(x));
}

export function getArrayChanges<T extends string | number>(
  oldArray: T[],
  newArray: T[]
): {
  added: T[];
  removed: T[];
  isAdded: boolean;
  isRemoved: boolean;
  isChanged: boolean;
} {
  const added = difference(newArray, oldArray);
  const removed = difference(oldArray, newArray);
  const isAdded = added.length > 0;
  const isRemoved = removed.length > 0;
  const isChanged = isAdded || isRemoved;

  return { added, removed, isAdded, isRemoved, isChanged };
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

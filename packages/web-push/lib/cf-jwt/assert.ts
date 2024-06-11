export function assertString<T extends string>(
  value: unknown,
): asserts value is T {
  if (typeof value !== 'string') {
    throw new Error('value must be a string');
  }
}

export function assertArray(value: unknown): asserts value is Array<unknown> {
  if (!Array.isArray(value)) {
    throw new Error('value must be an array');
  }
}

export function assertObject(
  value: unknown,
): asserts value is Record<string, unknown> {
  if (typeof value !== 'object' || value === null) {
    throw new Error('value must be an object');
  }
}

export function assertTruthy<T>(
  value: T,
): asserts value is Exclude<T, false | null | ''> {
  if (!value) {
    throw new Error('value must be truthy');
  }
}

export function assertKeyInObject<T extends string>(
  obj: { [key: string]: unknown },
  keyName: T,
): asserts obj is {
  [key in T]: unknown;
} {
  if (!(keyName in obj)) {
    throw new Error(`obj must have a ${keyName} property`);
  }
}

export function assertStringKeyInObject<T extends string>(
  obj: { [key: string]: unknown },
  keyName: T,
): asserts obj is {
  [key in T]: string;
} {
  assertKeyInObject(obj, keyName);
  assertString(obj[keyName]);
}

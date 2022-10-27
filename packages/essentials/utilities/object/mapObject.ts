export function mapObject<Key extends string | number | symbol, Value, Return>(
  record: Record<Key, Value>,
  callback: (entry: [Key, Value]) => Return
): Return[] {
  return Object.entries(record).map(([key, value]) =>
    callback([key as Key, value as Value])
  );
}

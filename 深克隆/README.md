# TypeScript 深克隆实现

```typescript
function deepClone<T>(obj: T, hash = new WeakMap()): T {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj.getTime()) as any;
    if (obj instanceof RegExp) return new RegExp(obj) as any;
    if (hash.has(obj)) return hash.get(obj);

    const clone: any = Array.isArray(obj) ? [] : {};
    hash.set(obj, clone);

    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            clone[key] = deepClone((obj as any)[key], hash);
        }
    }
    return clone as T;
}

// 使用示例
const original = { a: 1, b: { c: 2 } };
const copy = deepClone(original);
console.log(copy); // { a: 1, b: { c: 2 } }
```


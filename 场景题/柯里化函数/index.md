# 柯里化函数的例子与解释

柯里化（Currying）是一种将多参数函数转换为一系列单参数函数的技术。它在函数式编程中非常常见，能够提高代码的可复用性和可读性。

## 示例 1：基本的柯里化函数

```javascript
// 普通函数
function add(a, b) {
    return a + b;
}

// 柯里化后的函数
function curriedAdd(a) {
    return function(b) {
        return a + b;
    };
}

// 使用
const add5 = curriedAdd(5);
console.log(add5(3)); // 输出 8
```

### 解释
- `curriedAdd` 将 `add` 函数拆分为两个单参数函数。
- 通过 `curriedAdd(5)`，我们创建了一个固定加 5 的新函数 `add5`。

---

## 示例 2：使用箭头函数实现柯里化

```javascript
const multiply = a => b => a * b;

// 使用
const double = multiply(2);
console.log(double(4)); // 输出 8
```

### 解释
- 使用箭头函数可以更简洁地实现柯里化。
- `multiply(2)` 返回一个函数，该函数会将输入的参数乘以 2。

---

## 示例 3：通用柯里化函数

```javascript
function curry(fn) {
    return function curried(...args) {
        if (args.length >= fn.length) {
            return fn(...args);
        } else {
            return (...nextArgs) => curried(...args, ...nextArgs);
        }
    };
}

// 使用
function sum(a, b, c) {
    return a + b + c;
}

const curriedSum = curry(sum);
console.log(curriedSum(1)(2)(3)); // 输出 6
console.log(curriedSum(1, 2)(3)); // 输出 6
```

### 解释
- `curry` 函数可以将任意多参数函数转换为柯里化函数。
- 它通过检查参数数量决定是调用原函数还是返回一个新的函数。

---

柯里化的主要优点是可以部分应用函数参数，从而提高代码的灵活性和可复用性。
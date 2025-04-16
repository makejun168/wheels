# 延迟加载JS的实例与原理

## 实例：使用`async`和`defer`属性

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>延迟加载JS示例</title>
</head>
<body>
    <h1>延迟加载JS示例</h1>
    <script src="example-async.js" async></script>
    <script src="example-defer.js" defer></script>
</body>
</html>
```

### `example-async.js`
```javascript
console.log('Async script loaded and executed.');
```

### `example-defer.js`
```javascript
console.log('Defer script loaded and executed.');
```

## 原理

1. **`async`属性**：
     - 脚本文件会异步加载，加载完成后立即执行。
     - 不保证执行顺序，适用于独立模块化的脚本。

2. **`defer`属性**：
     - 脚本文件会异步加载，但会在HTML解析完成后按顺序执行。
     - 适用于依赖DOM结构的脚本。

## 用法

- **`async`**：适合加载不依赖其他脚本或DOM的功能性脚本，如统计工具或广告脚本。
- **`defer`**：适合需要操作DOM或依赖其他脚本的场景，如初始化页面逻辑。

通过合理使用`async`和`defer`，可以优化页面加载性能，减少阻塞，提高用户体验。
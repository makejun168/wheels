# 浏览器性能监控

## 什么是性能监控？
性能监控是指通过工具或代码对浏览器运行时的性能指标进行采集、分析和展示的过程。它帮助开发者了解应用的运行状态，发现性能瓶颈，从而优化用户体验。

## 为什么需要性能监控？
1. **提升用户体验**：性能问题会导致页面加载缓慢或交互卡顿，影响用户满意度。
2. **定位问题**：通过监控数据可以快速定位性能瓶颈，例如慢加载资源或高耗时脚本。
3. **优化资源使用**：减少不必要的资源消耗，提升应用效率。
4. **数据驱动优化**：通过量化数据指导性能优化决策。

## 浏览器性能监控应该怎么做？
1. **使用浏览器内置工具**：
    - Chrome DevTools 提供了性能分析工具，可以记录和分析页面加载、脚本执行等性能数据。
    - Firefox 和 Edge 也有类似的性能分析工具。

2. **采集关键性能指标**：
    - **页面加载时间**：如 `DOMContentLoaded` 和 `load` 事件时间。
    - **首屏渲染时间**：用户首次看到内容的时间。
    - **交互延迟**：如 First Input Delay (FID)。
    - **资源加载时间**：CSS、JS、图片等资源的加载耗时。

3. **使用性能监控库**：
    - [Lighthouse](https://developers.google.com/web/tools/lighthouse)：自动化性能分析工具。
    - [Web Vitals](https://web.dev/vitals/): 提供核心性能指标的采集方法。
    - [Perfume.js](https://zizzamia.github.io/perfume/): 一个轻量级性能监控库。

4. **自定义监控**：
    - 使用 `Performance` API 获取性能数据，例如 `performance.timing` 和 `performance.mark`。
    - 结合日志系统，将性能数据上传到服务器进行分析。

5. **持续监控与优化**：
    - 部署性能监控工具到生产环境，持续采集数据。
    - 定期分析监控数据，发现并解决性能问题。

通过性能监控，开发者可以更好地优化应用，提升用户体验。

## 自定义监控怎么做？

自定义监控可以通过浏览器提供的 `Performance` API 和日志系统实现，以下是一个完整的流程和示例：

### 1. 获取性能数据
使用 `Performance` API 获取页面加载的关键性能指标，例如 `navigationStart` 和 `loadEventEnd`。

```javascript
function getPerformanceMetrics() {
    const timing = performance.timing;
    return {
        dnsLookupTime: timing.domainLookupEnd - timing.domainLookupStart, // DNS 查询时间
        tcpConnectionTime: timing.connectEnd - timing.connectStart,       // TCP 连接时间
        responseTime: timing.responseEnd - timing.responseStart,         // 响应时间
        domContentLoadedTime: timing.domContentLoadedEventEnd - timing.navigationStart, // DOMContentLoaded 时间
        pageLoadTime: timing.loadEventEnd - timing.navigationStart       // 页面加载总时间
    };
}
```

### 2. 记录自定义标记
通过 `performance.mark` 和 `performance.measure` 记录自定义性能事件。

```javascript
performance.mark('startTask');
// 模拟任务
setTimeout(() => {
    performance.mark('endTask');
    performance.measure('taskDuration', 'startTask', 'endTask');
    const measure = performance.getEntriesByName('taskDuration')[0];
    console.log(`任务耗时: ${measure.duration}ms`);
}, 500);
```

### 3. 上传性能数据
将采集到的性能数据发送到服务器，便于后续分析。

```javascript
function sendPerformanceData(data) {
    fetch('https://your-server.com/performance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    }).catch(err => console.error('上传性能数据失败:', err));
}

// 示例：上传页面加载性能数据
const metrics = getPerformanceMetrics();
sendPerformanceData(metrics);
```

### 4. 数据分析与展示
在服务器端存储和分析性能数据，生成报表或可视化图表，帮助开发者发现性能瓶颈。

### 5. 持续优化
根据监控数据，定期优化代码和资源，提升应用性能。

通过以上步骤，开发者可以实现自定义性能监控，全面掌握应用的运行状态。
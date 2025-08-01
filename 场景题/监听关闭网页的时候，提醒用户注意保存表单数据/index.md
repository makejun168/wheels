在网页中监听用户关闭 Tab 页或浏览器窗口，并提醒保存表单信息，是提升用户体验的常见需求。以下是具体实现方法，包括核心 API、使用场景、注意事项等细节：


### 一、核心 API：`beforeunload` 事件
浏览器提供了 `beforeunload` 事件，专门用于监听页面即将卸载（关闭、刷新、跳转）的动作。通过该事件可以触发提示弹窗，阻止用户误操作。

#### 基本用法
```javascript
// 监听 beforeunload 事件
window.addEventListener('beforeunload', function(e) {
  // 1. 判断表单是否有未保存的内容（关键：避免无意义弹窗）
  const isFormDirty = checkFormDirty(); // 自定义函数：检查表单是否被修改
  
  if (!isFormDirty) {
    // 表单未修改，不触发提示
    return;
  }

  // 2. 触发提示的核心逻辑
  // 标准做法：设置 returnValue（部分浏览器依赖）
  e.returnValue = '您有未保存的内容，确定要离开吗？';
  
  // 部分浏览器需要返回字符串（兼容旧版本）
  return '您有未保存的内容，确定要离开吗？';
});
```

#### 效果说明
- 当用户触发关闭窗口/标签页、刷新页面、跳转其他链接时，会弹出浏览器默认提示框（内容可能被浏览器修改，比如 Chrome 会显示固定文案，忽略自定义文字）。
- 弹窗会包含两个选项（如“离开”和“取消”），用户选择“取消”则留在当前页面，选择“离开”则继续卸载。


### 二、判断表单是否“未保存”：避免无效弹窗
`beforeunload` 事件如果盲目触发，会导致用户每次关闭页面都看到弹窗（即使表单没修改），反而影响体验。因此必须先判断表单是否有未保存的内容（即“脏数据”）。

#### 实现思路
1. **初始化时保存表单初始状态**：页面加载完成后，记录表单各字段的初始值（如输入框、下拉框、复选框等）。
2. **监听表单变化**：当用户修改表单时，标记为“脏数据”。
3. **关闭时校验**：在 `beforeunload` 事件中，通过“脏数据”标记判断是否需要提示。

#### 示例代码
```javascript
// 1. 保存表单初始状态（假设表单有 id="myForm"）
let formInitialState = {};

function saveInitialFormState() {
  const form = document.getElementById('myForm');
  const inputs = form.querySelectorAll('input, select, textarea');
  inputs.forEach(input => { 
    // 记录每个字段的初始值（根据类型处理）
    if (input.type === 'checkbox' || input.type === 'radio') {
      formInitialState[input.name] = input.checked;
    } else {
      formInitialState[input.name] = input.value;
    }
  });
}

// 页面加载完成后保存初始状态
window.addEventListener('load', saveInitialFormState);

// 2. 监听表单变化，标记是否为脏数据
let isFormDirty = false;

function watchFormChanges() {
  const form = document.getElementById('myForm');
  form.addEventListener('input', () => {
    // 每次输入时检查是否与初始状态不同
    isFormDirty = checkFormDirty();
  });
  // 监听复选框、下拉框等变化
  form.addEventListener('change', () => {
    isFormDirty = checkFormDirty();
  });
}

// 3. 检查表单是否有未保存内容
function checkFormDirty() {
  const form = document.getElementById('myForm');
  const inputs = form.querySelectorAll('input, select, textarea');
  for (const input of inputs) {
    const currentValue = input.type === 'checkbox' || input.type === 'radio' 
      ? input.checked 
      : input.value;
    // 与初始状态对比，有差异则视为脏数据
    if (currentValue !== formInitialState[input.name]) {
      return true;
    }
  }
  return false;
}

// 初始化监听表单变化
watchFormChanges();

// 4. 结合 beforeunload 事件使用
window.addEventListener('beforeunload', function(e) {
  if (isFormDirty) {
    e.returnValue = '您有未保存的内容，确定要离开吗？';
    return e.returnValue;
  }
  // 表单未修改，不触发提示
});
```


### 三、特殊场景处理
#### 1. 区分“关闭”和“刷新/跳转”
`beforeunload` 事件无法直接区分用户是“关闭窗口”还是“刷新/跳转”，但可以通过其他方式间接判断：
- 监听 `onbeforeunload` 时，配合 `performance.navigation.type` 判断跳转类型（但该 API 已被废弃，推荐用 `navigation` API）。
- 实际场景中，无需严格区分，只要表单有未保存内容，无论用户做什么操作（关闭、刷新、跳转），都应提示。

#### 2. 兼容问题
- **Chrome/Firefox**：为防止滥用，自定义提示文字会被忽略，弹窗显示浏览器默认文案（如“此页面要求您确认是否离开 - 您输入的数据可能不会被保存”）。
- **Safari**：行为更严格，只有用户与页面有交互（如点击、输入）后，`beforeunload` 事件才会生效，否则直接关闭页面。
- **移动端浏览器**：大部分不支持 `beforeunload` 弹窗，需通过其他方式提示（如页面内浮层）。


### 四、增强体验的补充方案
1. **自动保存草稿**  
   结合 `setInterval` 或表单 `input` 事件，定期将表单内容保存到 `localStorage` 或后端，即使用户关闭页面，再次打开时也能恢复数据。  
   示例：
   ```javascript
   // 监听输入，500ms 防抖后保存到本地
   let saveTimer;
   form.addEventListener('input', () => {
     clearTimeout(saveTimer);
     saveTimer = setTimeout(() => {
       localStorage.setItem('formDraft', JSON.stringify(getFormData())); // 自定义获取表单数据的函数
     }, 500);
   });
   ```

2. **页面内浮层提示**  
   对于移动端浏览器（不支持 `beforeunload` 弹窗），可监听用户点击“返回”按钮（通过 `popstate` 事件），显示页面内浮层提示：
   ```javascript
   window.addEventListener('popstate', () => {
     if (isFormDirty) {
       // 显示自定义浮层：“您有未保存内容，确定要离开吗？”
       showConfirmModal();
       // 阻止默认返回行为（部分浏览器有效）
       history.pushState(null, null, window.location.href);
     }
   });
   ```

3. **主动触发检查**  
   在用户点击页面内的“跳转链接”或“关闭按钮”时，主动检查表单状态，避免依赖 `beforeunload`：
   ```javascript
   // 点击“取消”按钮时
   document.getElementById('cancelBtn').addEventListener('click', (e) => {
     if (isFormDirty) {
       if (!confirm('您有未保存内容，确定要取消吗？')) {
         e.preventDefault(); // 阻止默认行为
       }
     }
   });
   ```


### 五、注意事项
1. 不要滥用 `beforeunload`：只有当表单确实有未保存内容时才触发，否则会让用户反感。
2. 无法 100% 拦截关闭操作：浏览器为了安全，允许用户强制关闭页面（如任务管理器结束进程），因此自动保存草稿是必要的补充。
3. 隐私考虑：如果表单包含敏感信息（如密码），避免保存到 `localStorage`，可选择会话存储（`sessionStorage`）或加密后保存。


### 总结
通过 `beforeunload` 事件监听页面卸载，结合表单脏数据判断，可以实现关闭页面时的保存提示；同时配合自动保存草稿、页面内浮层等方案，能覆盖更多场景和设备，最大限度减少用户数据丢失的风险。核心逻辑是：** 监听表单变化 → 标记脏数据 → 卸载前检查并提示 → 自动保存兜底 **。
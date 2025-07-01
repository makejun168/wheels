```markdown
# 防止用户复制内容并添加水印

你可以通过以下方式防止用户复制内容，并在复制时自动添加水印信息：

```html
<div id="content">
    这里是需要保护的内容。
</div>
<script>
document.getElementById('content').addEventListener('copy', function(e) {
    const selection = window.getSelection();
    const copiedText = selection.toString();
    const watermark = '\n\n—— 复制自 wheels 场景题';
    const newText = copiedText + watermark;
    e.clipboardData.setData('text/plain', newText);
    e.preventDefault();
});
</script>
```

这样，当用户复制 `#content` 区域的内容时，剪贴板中会自动添加水印信息。
```
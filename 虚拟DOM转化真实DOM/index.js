const vnode = {
    tag: 'DIV',
    attrs: {
        id: 'app'
    },
    children: [
        {
            tag: 'SPAN',
            children: [
                {
                    tag: 'A',
                    children: []
                }
            ]
        },
        {
            tag: 'SPAN',
            children: [
                {
                    tag: 'A',
                    children: []
                },
                {
                    tag: 'A',
                    children: []
                }
            ]
        }
    ]

}

/**
 * 将 vnode 转化为真实的DOM
 * @param vnode
 * @returns {Text|any}
 */
function render(vnode) {
    if (typeof vnode === 'number') {
        vnode = String(vnode)
    }

    if (typeof vnode === 'string') {
        return document.createTextNode(vnode)
    }

    const element = document.createElement(vnode.tag);

    if (vnode.attrs) {
        Object.keys(vnode.attrs).forEach(key => {
            element.setAttribute(key, vnode.attrs[key])
        })
    }

    // 开始递归的过程
    if (Array.isArray(vnode.children)) {
        vnode.children.forEach(childNode => {
            element.appendChild(render(childNode)); // 这里进行递归 返回真实的 DOM
        })
    }

    return element;
}

render(vnode)
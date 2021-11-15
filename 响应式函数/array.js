const render = (action, ...args) => {
    console.log(`Action = ${action} args=${args.join(',')}`)
}

const arrPrototype = Array.prototype; // 存在于原型链上
const newArrayPrototype = Object.create(arrPrototype); // 创建新的 数组原型

['pop', 'push', 'shift', 'unshift', 'sort', 'splice', 'reverse'].forEach(name => {
    newArrayPrototype[name] = function () {
        arrPrototype[name].apply(this, [...arguments]); // 执行原来数组的方法

        render(name, ...arguments);
    }
})

const reactive  = (obj) => {
    if (Array.isArray(obj)) {
        obj.__proto__ = newArrayPrototype; // 新的原型对象
    }
}

const data = [1,2,3,4]
reactive(data)

data.push(5) // Action = push args = 5
data.splice(0, 2); // Action = splice, args=0,2
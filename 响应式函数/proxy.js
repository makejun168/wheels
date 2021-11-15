// Proxy 实现响应式

let observeStore = new Map();

function makeObservable(target) {
    let handlerName = Symbol('handler')
    observeStore.set(handlerName, []);

    target.observe = function (handler) {
        observeStore.get(handlerName).push(handler); // 函数推送到数组中
    }

    const proxyHandler = {
        get(target, property, receiver) {
            if (typeof target[property] === 'obj' && target[property] !== null) {
                return new Proxy(target[property], proxyHandler)
            }


            let success = Reflect.get(...arguments)

            if (success) {
                observeStore.get(handlerName).forEach(handler => handler('GET', property, target[property]))
            }

            return success;
        },
        set(target, property, value, receiver) {
            let success = Reflect.set(...arguments)

            if (success) {
                observeStore.get(handlerName).forEach(handler => handler('SET', property, value))
            }
            return success;
        },
        deleteProperty(target, property) {
            let success = Reflect.deleteProperty(...arguments)

            if (success) {
                observeStore.get(handlerName).forEach(handler => handler('DELETE', property))
            }

            return success;
        }
    }

    return new Proxy(target, proxyHandler)
}

let user = {}

user = makeObservable(user);

user.observe((action, key, value) => {
    console.log(`Action = ${action} key=${key} value=${value || ''}`)
})


user.name = 'kobe'

console.log(user.name)

delete user.name;
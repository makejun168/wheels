// 循环引用 function Symbol 正则都不能使用 JSON.stringify
// weakMap 对对象的弱引用 将对象存在 Object 作为 key 进行存储


function deepClone(obj, hash = new WeakMap()) {
    if (obj === null) {
        return null;
    }

    if (obj instanceof Date) {
        return new Date(obj);
    }

    if (obj instanceof RegExp) {
        return new RegExp(obj)
    }

    // 基础数据类型 Boolean Number String undefined
    if (typeof obj !== 'object') {
        return obj;
    }

    // 处理循环引用 如果存在
    if (hash.has(obj)) {
        return hash.get(obj);
    }

    // 获取下面的数据
    const resObj = Array.isArray(obj) ? [] : {};

    hash.set(obj, resObj); // 将原来的obj 作为 key 后面 resObj 作为数据

    // 遍历 深拷贝
    Reflect.ownKeys(obj).forEach(key => {
        // 判断当前 resObj 是否存在 key
        if (!resObj.hasOwnProperty(key)) {
            resObj[key] = deepClone(obj[key], hash); // 这里做递归 多层的数据
        }
    })

    return resObj;
}

let obj1 = {
    a: 1,
    b: undefined,
    c: false,
    d: '123123',
    e: {
        a: 1,
        b: undefined,
        c: false,
        d: '123123',
        e: {
            a: 1,
            b: undefined,
            c: false,
            d: '123123',
        }
    },
    f: [
        {
            a: 1,
            b: undefined,
            c: false,
            d: '123123',
            e: {
                a: 1,
                b: undefined,
                c: false,
                d: '123123',
            }
        },
    ],
    g: new Date(),
    h: /[0-9]/g
}

const newObj = deepClone(obj1);

console.log(newObj === obj1);
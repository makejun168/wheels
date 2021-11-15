const render = (key, val) => {
    console.log(`set key=${key} val=${val}`)
}

const defineReactive = (obj, key, val) => {
    reactive(val); // 递归

    Object.defineProperty(obj, key, {
        get() {
            return val
        },
        set(newVal) {
            if (val === newVal) {
                return;
            }

            val = newVal

            render(key, val); // console
        }
    })
}

// 遍历对象的 Key 进行递归
const reactive = (obj) => {
    if (typeof obj === 'object') {
        for (const key in obj) {
            defineReactive(obj, key, obj[key])
        }
    }
}

const data = {
    a: 1,
    b: 2,
    c: {
        c1: {
            af: 999
        },
        c2: 4
    }
}

reactive(data)

data.a = 5;
data.b = 7;
data.c.c2 = 4;
data.c.c1.af = 666;
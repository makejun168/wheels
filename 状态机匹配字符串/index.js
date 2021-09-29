let length;
let i = 0;
function match(str) {
    let state = start;
    length = str.length;
    for (let c of str) {
        state = state(c);
    }
    if (state === end) {
        console.log("已找到");
    } else {
        console.log("未找到");
    }
}
function start(c) {
    if (c === "a") {
        return foundA;
    } else {
        return start;
    }
}
function foundA(c) {
    if (c === "b") {
        return foundB;
    } else {
        return start(c);
    }
}
function foundB(c) {
    if (c === "a") {
        return foundA2;
    } else {
        return start(c);
    }
}
function foundA2(c) {
    if (c === "b") {
        return foundB2;
    } else {
        return start(c);
    }
}
function foundB2(c) {
    if (c === "a") {
        return foundA3;
    } else {
        return start(c);
    }
}
function foundA3(c) {
    if (c === "b") {
        return foundB3;
    } else {
        return start(c);
    }
}
function foundB3(c){
    if(c==='x'){
        return end(c)
    }else{
        return foundB2(c)
    }
}
function end(c) {
    return end;
}

match("ab11111abab11111abababx");
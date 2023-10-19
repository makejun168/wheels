const key = Math.floor(Math.random() * 100 + 1)
let guess = 0
let count = 1

guess = parseInt(prompt('欢迎来到<猜数字>游戏，请在七次内找到 1-100 中记录的随机数'))

if (guess) {
  while (count < 7) {
    if (guess > key) {
        guess = parseInt(prompt(`您猜的数字大了，还剩${7 - count}次`))
    } else if (guess < key) {
        guess = parseInt(prompt(`您猜的数字小了，还剩${7 - count}次`))
    } else {
        prompt('恭喜 您猜对了！！！', `您用了${count}次数猜中 按 enter 键退出`)
        break
    }

    count++
  }
} else {
  alert('退出游戏')
}

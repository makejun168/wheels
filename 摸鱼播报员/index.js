const http = require('http');

/**
 * 摸鱼日记
 */
class CatchFish {
    constructor() {
        this.key = 'fa6745256d34f13c9ef76a9c11673675'; // 接口请求 key
        this.requestUrl = 'http://v.juhe.cn/calendar/year'; // 获取数据地址
        this.now = new Date(); // 当前的日期
        this.solgan = '工作学习再累，一定不要忘记摸鱼哦！\n';
        this.tips = '有事没事起身去茶水间，去厕所，去廊道走走，别老在工位上坐着，钱是老板的，但命是自己\n';
        // this.nationalHoliday = new Date('2021-10-01');
        // this.newYearHoliday = new Date('2022-01-01');
        // this.springFestival = new Date('2022-01-31');
        // this.chingMingFestival = new Date('2022-04-05');
        // this.workingHoliday = new Date('2022-05-01');
        // this.dragonBoatFestival = new Date('2022-06-03');
        // this.middleAutumFestival = new Date('2022-09-10');
        this.oneDay = 86400000; // 一天的时间
    }

    /**
     * 获取当前的年月日
     * @returns {string}
     */
    getCurrentDay() {
        return `${this.now.getFullYear()}年${this.now.getMonth() + 1}月${this.now.getDate()}日`
    }

    /**
     * 获取日期之间的差距
     * @param now
     * @param target
     * @returns {number}
     */
    getDateGap(now, target) {
        // 一天等于多少 86400000 毫秒
        // 返回的是 日期数字
        if (target.getTime() > now.getTime()) {
            return Math.ceil((target.getTime() - now.getTime()) / this.oneDay)
        } else {
            return Math.ceil((now.getTime() - target.getTime()) / this.oneDay)
        }
    }


    /**
     * 获取 节日间隔消息
     * @param festival
     * @param day
     * @returns {string}
     */
    getGapMsg(festival, day) {
        return `距离${festival}假期还有${day}天\n`
    }

    /**
     * 判断假期是否已经过了 o(╥﹏╥)o
     * @param now
     * @param target
     * @returns {boolean}
     */
    isGoneAway(now, target) {
        return target.getTime() <= now.getTime()
    }

    /**
     * 获取 万年历数据
     * @param date
     * @param result
     */
    requestData(date, result) {
        http.get(this.requestUrl + `?year=${date}&key=${this.key}`,  (res) => {
            if (res.statusCode === 200) {
                console.log(`Got response: ${res.statusCode}`);

                res.on('data', (chunk) => {
                    const { data } = JSON.parse(chunk).result;
                    const { holiday_list } = data;

                    // 拼接打印最后的结果
                    for (let holiday of holiday_list) {
                        if (this.isGoneAway(this.now, new Date(holiday.startday))) {
                            continue
                        } else {
                            // 判断当前时间是否为 假期以后，如果是则 跳过
                            result += this.getGapMsg(holiday.name, this.getDateGap(this.now, new Date(holiday.startday)))
                        }
                    }

                    console.log(result); // 最后结果 打印到控制台
                });
            } else {
                console.log('请求发生错误')
            }
            // console.log(res);
        })
    }

    /**
     * 获取摸鱼数据
     */
    getResult() {
        let result = this.getCurrentDay() + this.solgan + this.tips;
        // 判断当前是在哪个位置，判断当前的时间如果超过则显示 0 天

        this.requestData(new Date().getFullYear(), result);

    }
}

const reporter = new CatchFish();
reporter.getResult();
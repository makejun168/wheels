/**
 * 摸鱼日记
 */
class CatchFish {
    constructor() {
        this.now = new Date(); // 当前的日期
        this.solgan = '工作学习再累，一定不要忘记摸鱼哦！\n';
        this.tips = '有事没事起身去茶水间，去厕所，去廊道走走，别老在工位上坐着，钱是老板的，但命是自己\n';
        this.nationalHoliday = new Date('2021-10-01');
        this.newYearHoliday = new Date('2022-01-01');
        this.springFestival = new Date('2022-01-31');
        this.chingMingFestival = new Date('2022-04-05');
        this.workingHoliday = new Date('2022-05-01');
        this.dragonBoatFestival = new Date('2022-06-03');
        this.middleAutumFestival = new Date('2022-09-10');
        this.oneDay = 86400000; // 一天的时间
        this.holidays = [
            {
                name: '国庆节',
                date: this.nationalHoliday
            },
            {
                name: '元旦',
                date: this.newYearHoliday
            },
            {
                name: '春节',
                date: this.springFestival,
            },
            {
                name: '清明节',
                date: this.chingMingFestival
            },
            {
                name: '劳动节',
                date: this.workingHoliday
            },
            {
                name: '端午节',
                date: this.dragonBoatFestival
            },
            {
                name: '中秋节',
                date: this.middleAutumFestival
            },
        ]
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
     * 获取间隔信息
     * @param {string} festival
     * @param {number} day
     */
    getGapMsg(festival, day) {
        return `距离${festival}假期还有${day}天\n`
    }

    /**
     * 判断假期是否已经过了 o(╥﹏╥)o
     */
    isGoneAway(now, target) {
        return target.getTime() > now.getTime() ? false : true
    }

    /**
     * 获取摸鱼数据
     */
    getResult() {
        let result = this.getCurrentDay() + this.solgan + this.tips;
        // 判断当前是在哪个位置，判断当前的时间如果超过则显示 0 天

        // 拼接打印最后的结果
        for (let holiday of this.holidays) {
            if (this.isGoneAway(this.now, holiday.date)) {
                continue
            } else {
                // 判断当前时间是否为 假期以后，如果是则 跳过
                result += this.getGapMsg(holiday.name, this.getDateGap(this.now, holiday.date))
            }
        }

        console.log(result); // 打印最后结果
    }
}

const reporter = new CatchFish();
reporter.getResult();
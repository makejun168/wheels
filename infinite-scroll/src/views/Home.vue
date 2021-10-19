<template>
  <!--  真正需要滚动的东西-->
  <div
      class="infinite-list-container"
      ref="list"
      @scroll="scrollEvent"
  >
    <div class="scrollTopBtn" @click="scrollToTop" v-show="end > 20">
      回到顶部
    </div>
    <div class="infinite-list-phantom" :style="listHeight + 'px'"></div>
    <div class="infinite-list" :style="{transform: getTransform}">
      <div class="infinite-list-item" v-for="item in visibleData" :key="item.id" :style="{height: itemSize + 'px', listHeight: itemSize + 'px'}">
        <div class="left-section">
          {{item.title[0]}}
        </div>
        <div class="right-section">
          <div class="title">
            {{item.title}}
          </div>
          <div class="desc">
            {{item.content}}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

interface Data {
  title?: string | number;
  content?: string | number;
  id?: string | number;
}

@Component
export default class Home extends Vue {
  public readonly itemSize: number = 100
  public listData: Data[] = [];

  public screenHeight: number = document.documentElement.clientHeight || document.body.clientHeight; // 可视区域的高度

  // 可视区域列表数量
  public visibleCount: number = Math.ceil(this.screenHeight / this.itemSize); // 一列可以显示多少个 // 这里是 7个 具体情况具体分析

  // 偏移量
  public startOffset: number = 0;

  // 起始的索引
  public start: number = 0;

  // 结束索引
  public end: number = this.start + this.visibleCount; // 7

  // 列表总高度
  get listHeight() {
    return this.listData.length * this.itemSize
  }

  // y 轴上的偏移
  get getTransform() {
    return `translate3d(0, ${this.startOffset}px, 0)`
  }

  // 获取可视区域的数据
  get visibleData() {
    return this.listData.slice(this.start, Math.min(this.end, this.listData.length)); // 只截取 当前索引 到 结束索引的数据
  }

  // @ts-ignore
  public $refs: {
    list: any
  }

  getTenListData() {
    if (this.listData.length >= 200) {
      return [];
    }
    return new Array(10).fill({}).map((item, idx) => ({ id: idx, title: Math.floor(Math.random() * 1000), content: '12312312321' }))
  }

  created() {
    this.listData = this.getTenListData();
  }

  public scrollToTop() {
    this.$refs.list.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth'
    })
  }

  public scrollEvent(e: any) {
    // 当前滚动位置
    const scrollTop = this.$refs.list.scrollTop;

    // 此时的开始索引
    this.start = Math.floor(scrollTop / this.itemSize);

    console.log(this.start); // 页码 pageNum 类似

    // 此时的结束索引
    this.end = this.start + this.visibleCount; // 永远是 7 慢慢 加上去

    // console.log(this.end)

    if (this.end > this.listData.length) {
      this.listData = this.listData.concat(this.getTenListData()); // 拼数据
    }


    // console.log((scrollTop % this.itemSize))
    // 此时的偏移量
    this.startOffset = scrollTop - (scrollTop % this.itemSize); // 滚动距离 - (滚动距离 整除 7)
  }

}
</script>

<style>

.scrollTopBtn {
  position: fixed;
  border-radius: 50%;
  font-size: 12px;
  color: white;
  background: goldenrod;
  bottom: 101px;
  right: 20px;
  z-index: 10000;
  width: 50px;
  height: 50px;
  text-align: center;
  line-height: 50px;

}

.infinite-list-container {
  margin-top: 10px;
  height: 99%;
  overflow: scroll;
  position: relative;
  -webkit-overflow-scrolling: touch;
}

.infinite-list-phantom {
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  z-index: -1;
}

.infinite-list {
  left: 0;
  right: 0;
  top: 0;
  position: absolute;
  text-align: center;
}

.infinite-list-item {
  background: white;
  box-shadow: 0 0 10px rgba(144, 144, 144, 0.15);
  border-radius: 5px;

  display: flex;
  align-items: center;
  justify-content: center;
  /* padding: 10px; */
  margin-top: 10px;
}


.left-section {
  width: 25%;
  display: flex;
  justify-content: center;
  align-items: center;

  font-size: 25px;
  font-weight: bold;
  color: white;
  background: #6ab6fc;
  border-radius: 10px;
}

.right-section {
  height: 100%;
  margin-left: 20px;
  flex: 1;

}

.title {
  font-size: 14px;
  font-weight: 500;
  text-align: left;
  height: 14px;
}

.desc {
  margin-top: 10px;
  font-size: 12px;
  font-weight: 400;
  text-align: left;
  height: 12px;

}

</style>

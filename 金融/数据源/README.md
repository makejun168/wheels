# 金融数据源指南

**最后更新：** 2026年3月5日
**维护者：** Claude Code

## 概述

本目录用于存储和管理金融数据分析所需的数据源信息、API文档、数据获取脚本和相关工具。目的是建立系统化的数据获取和处理流程。

## 数据分类

### 1. 市场数据
- 股票价格、成交量、K线数据
- 指数成分股、权重数据
- 市场资金流向、融资融券数据

### 2. 基本面数据
- 财务报表（利润表、资产负债表、现金流量表）
- 盈利能力、成长性、估值指标
- 公司治理、股权结构信息

### 3. 宏观数据
- GDP、CPI、PMI等宏观经济指标
- 货币政策、利率、汇率数据
- 行业政策、监管动态

### 4. 另类数据
- 新闻舆情、社交媒体数据
- 供应链数据、物流数据
- 消费者行为、搜索趋势数据

## 主要数据源

### 免费公开数据源

#### 股票市场数据
| 数据源 | 覆盖范围 | 数据频率 | 获取方式 | 限制 |
|--------|---------|---------|---------|------|
| **雅虎财经** | 全球主要市场 | 日/周/月 | yfinance库、API | 延迟15分钟，历史数据完整 |
| **新浪财经** | A股、港股、美股 | 实时 | 网页爬取、API | 需要处理反爬，实时数据 |
| **东方财富** | A股、港股 | 实时 | 网页爬取、API | 数据全面，需处理反爬 |
| **腾讯财经** | A股、港股 | 实时 | 网页爬取 | 界面友好，数据准确 |
| **聚宽JQData** | A股 | 实时 | Python SDK | 需要注册，免费额度有限 |

#### 基本面数据
| 数据源 | 数据内容 | 更新频率 | 获取方式 |
|--------|---------|---------|---------|
| **巨潮资讯网** | A股财报、公告 | 实时 | 网页爬取、API |
| **香港交易所** | 港股财报、公告 | 实时 | 官网下载、披露易 |
| **SEC EDGAR** | 美股财报、文件 | 实时 | API、直接下载 |
| **CSMAR数据库** | 中国上市公司数据 | 季度 | 学术授权、部分免费 |

#### 宏观经济数据
| 数据源 | 覆盖范围 | 数据频率 | 获取方式 |
|--------|---------|---------|---------|
| **国家统计局** | 中国宏观经济 | 月度/季度 | 官网下载、API |
| **中国人民银行** | 金融数据 | 月度 | 官网报表 |
| **美联储** | 美国经济数据 | 多种频率 | API、数据库 |
| **世界银行** | 全球宏观数据 | 年度 | API、数据集 |

### 付费专业数据源

#### 国际专业平台
| 平台 | 特点 | 适用场景 | 成本 |
|------|------|---------|------|
| **Bloomberg** | 全球最全面的金融数据 | 机构投资、研究 | 极高 |
| **Reuters Eikon** | 新闻和数据结合 | 交易、研究 | 高 |
| **Wind** | 中国最权威的金融数据 | A股研究、投资 | 中高 |
| **同花顺iFinD** | 中国金融数据终端 | 个人和机构 | 中 |
| **CEIC** | 新兴市场数据专家 | 宏观研究 | 中 |

#### 量化数据平台
| 平台 | 特点 | 数据内容 | 适合用户 |
|------|------|---------|---------|
| **Quandl** | 另类数据丰富 | 基本面、另类数据 | 量化研究 |
| **Kaggle** | 数据集社区 | 各类金融数据集 | 学习研究 |
| **QuantConnect** | 回测平台+数据 | 历史价格数据 | 量化交易 |
| **RiceQuant** | 中国量化平台 | A股数据 | 中国量化 |

## 数据获取工具与技术

### Python数据获取库

#### 价格数据获取
```python
# yfinance - 雅虎财经数据
import yfinance as yf
ticker = yf.Ticker("00700.HK")  # 腾讯港股
hist = ticker.history(period="1y")  # 1年历史数据

# akshare - 中国金融数据
import akshare as ak
stock_zh_a_hist = ak.stock_zh_a_hist(symbol="000001", period="daily")
```

#### 基本面数据获取
```python
# tushare - 中国股票数据
import tushare as ts
ts.set_token('your_token')  # 需要注册获取token
pro = ts.pro_api()
df = pro.daily(ts_code='000001.SZ', start_date='20250101', end_date='20251231')

# baostock - 免费A股数据
import baostock as bs
lg = bs.login()  # 登录
rs = bs.query_history_k_data("sh.600000", "date,code,open,high,low,close", start_date='2025-01-01')
```

#### 宏观数据获取
```python
# pandas-datareader - 多数据源
import pandas_datareader.data as web
import datetime
start = datetime.datetime(2025, 1, 1)
end = datetime.datetime(2025, 12, 31)
gdp = web.DataReader('GDP', 'fred', start, end)  # 美联储经济数据
```

### JavaScript/Node.js数据获取

#### 前端数据获取
```javascript
// 使用axios获取API数据
import axios from 'axios';

async function getStockData(symbol) {
    try {
        const response = await axios.get(
            `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`
        );
        return response.data;
    } catch (error) {
        console.error('Error fetching stock data:', error);
    }
}

// 使用WebSocket获取实时数据
const ws = new WebSocket('wss://streamer.finance.yahoo.com');
ws.onopen = () => {
    ws.send(JSON.stringify({ subscribe: ["AAPL", "00700.HK"] }));
};
```

### 数据库存储方案

#### SQL数据库设计
```sql
-- 股票价格表
CREATE TABLE stock_prices (
    id INT PRIMARY KEY AUTO_INCREMENT,
    symbol VARCHAR(20) NOT NULL,
    date DATE NOT NULL,
    open DECIMAL(10,2),
    high DECIMAL(10,2),
    low DECIMAL(10,2),
    close DECIMAL(10,2),
    volume BIGINT,
    UNIQUE KEY idx_symbol_date (symbol, date)
);

-- 财务数据表
CREATE TABLE financial_statements (
    id INT PRIMARY KEY AUTO_INCREMENT,
    symbol VARCHAR(20) NOT NULL,
    report_date DATE NOT NULL,
    revenue DECIMAL(15,2),
    net_income DECIMAL(15,2),
    eps DECIMAL(10,2),
    total_assets DECIMAL(15,2),
    total_liabilities DECIMAL(15,2),
    statement_type ENUM('income', 'balance', 'cashflow')
);
```

#### NoSQL数据库设计
```json
// MongoDB文档示例
{
    "symbol": "00700.HK",
    "company_name": "腾讯控股",
    "daily_prices": [
        {
            "date": "2026-03-05",
            "open": 350.00,
            "high": 355.00,
            "low": 348.00,
            "close": 352.50,
            "volume": 15000000
        }
    ],
    "financials": {
        "latest_quarter": {
            "revenue": 150000000000,
            "net_income": 30000000000,
            "eps": 3.15
        }
    }
}
```

## 数据处理流程

### 1. 数据获取流程
```
原始数据源 → 爬虫/API获取 → 原始数据存储 → 数据清洗 → 标准化数据存储
```

### 2. 数据清洗步骤
1. **缺失值处理**：填充、插值或删除
2. **异常值检测**：3σ原则、IQR方法
3. **数据标准化**：统一格式、单位、频率
4. **去重处理**：删除重复记录
5. **时间对齐**：统一时间戳频率

### 3. 数据质量检查
- **完整性检查**：数据字段是否完整
- **一致性检查**：跨数据源数据是否一致
- **准确性检查**：与权威来源交叉验证
- **时效性检查**：数据更新是否及时

## API密钥管理

### 安全存储方案
```python
# config.py - 配置文件
API_KEYS = {
    'tushare': 'your_tushare_token',
    'alpha_vantage': 'your_alpha_vantage_key',
    'quandl': 'your_quandl_api_key'
}

# 环境变量方式（推荐）
import os
TUSHARE_TOKEN = os.getenv('TUSHARE_TOKEN')
```

### 使用限制管理
- 记录各API的调用频率限制
- 实现请求间隔控制
- 监控API使用量
- 准备备用数据源

## 数据更新策略

### 实时数据更新
- **价格数据**：每分钟或每小时更新
- **新闻舆情**：实时监控，有更新即抓取
- **市场数据**：交易日收盘后更新

### 定期数据更新
- **财务数据**：季度财报发布后更新
- **宏观数据**：月度/季度数据发布后更新
- **指数成分**：指数调整日更新

### 批处理任务设计
```python
# 使用APScheduler进行定时任务
from apscheduler.schedulers.background import BackgroundScheduler

scheduler = BackgroundScheduler()

# 每天收盘后更新数据
@scheduler.scheduled_job('cron', hour=16, minute=30)
def update_daily_data():
    update_stock_prices()
    update_market_data()

# 每周更新基本面数据
@scheduler.scheduled_job('cron', day_of_week='sat', hour=2)
def update_fundamental_data():
    update_financial_statements()
    update_company_info()
```

## 数据可视化工具

### Python可视化库
- **Matplotlib/Seaborn**：基础图表
- **Plotly/Dash**：交互式图表和仪表盘
- **Pyecharts**：ECharts的Python接口

### JavaScript可视化库
- **ECharts**：百度开源，功能强大
- **D3.js**：高度定制化，学习曲线陡
- **Chart.js**：简单易用，适合基础图表
- **Highcharts**：商业级，文档完善

### 仪表盘框架
- **Grafana**：监控和可视化平台
- **Redash**：开源BI工具
- **Metabase**：开源商业智能工具

## 实战示例

### 示例1：获取腾讯历史价格
```python
# scripts/fetch_tencent.py
import yfinance as yf
import pandas as pd
from datetime import datetime, timedelta

def fetch_tencent_history():
    # 获取腾讯港股数据
    ticker = yf.Ticker("00700.HK")

    # 获取5年历史数据
    end_date = datetime.now()
    start_date = end_date - timedelta(days=5*365)

    hist = ticker.history(start=start_date, end=end_date)

    # 保存到CSV
    hist.to_csv('data/tencent_historical_prices.csv')
    print(f"获取了{len(hist)}条记录，时间范围：{hist.index[0]} 到 {hist.index[-1]}")

    return hist

if __name__ == "__main__":
    fetch_tencent_history()
```

### 示例2：构建简单量化因子
```python
# scripts/calculate_factors.py
import pandas as pd
import numpy as np

def calculate_technical_indicators(prices_df):
    """计算技术指标"""
    df = prices_df.copy()

    # 移动平均线
    df['MA5'] = df['Close'].rolling(window=5).mean()
    df['MA20'] = df['Close'].rolling(window=20).mean()

    # RSI相对强弱指数
    delta = df['Close'].diff()
    gain = (delta.where(delta > 0, 0)).rolling(window=14).mean()
    loss = (-delta.where(delta < 0, 0)).rolling(window=14).mean()
    rs = gain / loss
    df['RSI'] = 100 - (100 / (1 + rs))

    # MACD
    exp1 = df['Close'].ewm(span=12, adjust=False).mean()
    exp2 = df['Close'].ewm(span=26, adjust=False).mean()
    df['MACD'] = exp1 - exp2
    df['Signal'] = df['MACD'].ewm(span=9, adjust=False).mean()

    return df
```

## 数据备份与版本控制

### 备份策略
1. **本地备份**：定期压缩备份到本地存储
2. **云备份**：上传到云存储（AWS S3、阿里云OSS等）
3. **增量备份**：只备份变化的数据，节省空间

### 版本控制
- 使用Git管理数据处理脚本
- 数据快照使用时间戳标记
- 重要数据版本建立标签

## 法律与合规注意事项

### 数据使用合规
1. **遵守服务条款**：严格遵守各数据源的API使用条款
2. **个人隐私保护**：不获取或存储个人隐私数据
3. **版权尊重**：尊重数据提供方的知识产权
4. **商业使用授权**：商业用途需获取相应授权

### 风险提示
1. **数据准确性**：免费数据可能存在延迟或错误
2. **API稳定性**：免费API可能随时变更或停止服务
3. **法律风险**：不当使用可能面临法律风险
4. **技术风险**：爬虫可能触发反爬机制

## 维护与更新

### 定期检查项目
1. **API有效性**：每月检查各API是否仍有效
2. **数据质量**：每周抽查数据完整性和准确性
3. **代码更新**：及时更新依赖库和脚本
4. **文档同步**：数据源变化时更新本文档

### 问题处理流程
1. **数据缺失**：检查API状态，尝试备用数据源
2. **数据错误**：与权威来源对比，修正处理逻辑
3. **性能问题**：优化数据获取和处理流程
4. **合规问题**：立即停止可能违规的操作

---
**重要提示**：数据是分析和决策的基础，确保数据的准确性、完整性和及时性至关重要。建议建立完善的数据质量管理体系。
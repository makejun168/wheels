# 金融数据获取脚本

## 概述

本目录包含金融数据获取的Python脚本，用于从多个数据源自动获取股票价格、财务报表、指数数据和宏观经济数据。

## 文件结构

```
scripts/
├── fetch_financial_data.py    # 主数据获取脚本
├── README.md                  # 本说明文件
└── (未来可能添加的脚本)
    ├── technical_analysis.py  # 技术分析脚本
    ├── fundamental_analysis.py # 基本面分析脚本
    └── data_cleaning.py       # 数据清洗脚本
```

## 快速开始

### 1. 安装依赖
```bash
pip install -r ../requirements.txt
```

### 2. 配置数据源
编辑 `../config.json` 文件，配置需要获取的股票代码和数据源设置。

### 3. 运行数据获取
```bash
python fetch_financial_data.py
```

### 4. 查看结果
数据将保存在 `../raw_data/` 目录下：
- `prices/` - 股票价格数据
- `financials/` - 财务报表数据
- `indices/` - 指数数据
- `macro/` - 宏观经济数据

## 脚本功能

### 主脚本：fetch_financial_data.py

#### 主要功能
1. **股票价格获取**：从雅虎财经获取历史价格数据
2. **财务报表获取**：获取利润表、资产负债表、现金流量表
3. **指数数据获取**：获取主要股票指数数据
4. **成分股信息**：获取指数成分股和权重
5. **宏观数据获取**：获取宏观经济指标
6. **数据报告生成**：生成数据获取统计报告

#### 使用方式
```python
from fetch_financial_data import FinancialDataFetcher

# 创建获取器
fetcher = FinancialDataFetcher()

# 获取所有数据
all_data = fetcher.fetch_all_data()

# 或单独获取
prices = fetcher.fetch_stock_prices(["00700.HK", "09988.HK"], period="1y")
financials = fetcher.fetch_financial_statements(["00700.HK"])
```

#### 命令行参数
脚本支持交互式菜单选择，也可以直接调用特定方法：
```bash
# 获取所有数据
python fetch_financial_data.py

# 在代码中调用
python -c "from fetch_financial_data import FinancialDataFetcher; f = FinancialDataFetcher(); f.fetch_all_data()"
```

## 数据格式

### 价格数据 (CSV格式)
```csv
Date,Open,High,Low,Close,Volume,Dividends,Stock Splits,symbol,data_source,fetch_time
2025-01-02,350.0,355.0,348.0,352.5,15000000,0.0,0.0,00700.HK,yfinance,2026-03-05 14:30:00
```

### 财务报表 (CSV格式)
- `income_statement.csv` - 利润表
- `balance_sheet.csv` - 资产负债表
- `cash_flow.csv` - 现金流量表

### 指数成分股 (JSON格式)
```json
{
  "index_name": "恒生科技指数",
  "index_symbol": "HSTECH",
  "update_date": "2026-03-05",
  "constituents": [
    {"symbol": "00700.HK", "name": "腾讯控股", "weight": 8.0}
  ]
}
```

## 配置说明

### 股票代码配置
在 `config.json` 的 `symbols` 部分配置需要获取的股票：

```json
"symbols": {
  "港股": ["00700.HK", "09988.HK"],
  "A股": ["000001.SZ"],
  "美股": ["AAPL"],
  "指数": ["^HSI", "^HSTECH"]
}
```

### 数据源配置
```json
"data_sources": {
  "yfinance": {
    "enabled": true,
    "rate_limit": 2  # 请求间隔(秒)
  }
}
```

### 获取设置
```json
"fetch_settings": {
  "default_period": "1y",      # 默认获取1年数据
  "default_interval": "1d",    # 默认日线数据
  "auto_fetch": false,         # 是否自动获取
  "data_retention_days": 365   # 数据保留天数
}
```

## 定时任务

### 使用APScheduler定时获取
```python
from apscheduler.schedulers.background import BackgroundScheduler
from fetch_financial_data import FinancialDataFetcher

scheduler = BackgroundScheduler()
fetcher = FinancialDataFetcher()

# 每天收盘后获取数据
@scheduler.scheduled_job('cron', hour=16, minute=30, day_of_week='mon-fri')
def daily_fetch():
    fetcher.fetch_all_data()

scheduler.start()
```

### 使用系统cron (Linux/macOS)
```bash
# 每天16:30运行
30 16 * * 1-5 cd /path/to/金融/数据源 && python scripts/fetch_financial_data.py >> logs/cron.log 2>&1
```

### 使用Windows任务计划程序
1. 创建基本任务
2. 设置每天触发
3. 程序: `python.exe`
4. 参数: `scripts/fetch_financial_data.py`
5. 开始于: `金融/数据源` 目录路径

## 错误处理

### 常见错误
1. **网络连接失败**：检查网络连接，重试机制
2. **API限制**：降低请求频率，遵守rate_limit
3. **数据缺失**：某些股票可能没有数据，跳过继续
4. **文件权限**：确保有写入权限

### 日志记录
- 日志文件: `../logs/data_fetch.log`
- 日志级别: INFO（可修改为DEBUG查看更多细节）

### 重试机制
脚本内置简单的错误处理和跳过机制，失败时会记录错误并继续处理其他股票。

## 扩展开发

### 添加新数据源
1. 在 `FinancialDataFetcher` 类中添加新方法
2. 在 `config.json` 中配置新数据源
3. 更新 `fetch_all_data` 方法调用新数据源

### 示例：添加新数据源
```python
def fetch_new_source_data(self, symbols):
    """从新数据源获取数据"""
    results = {}
    for symbol in symbols:
        try:
            # 实现新数据源的获取逻辑
            data = self._call_new_source_api(symbol)
            results[symbol] = data
        except Exception as e:
            logger.error(f"从新数据源获取 {symbol} 失败: {e}")
    return results
```

### 数据处理管道
建议的数据处理流程：
1. **数据获取** → **原始数据存储** → **数据清洗** → **标准化存储** → **分析使用**

## 性能优化

### 批量获取
```python
# 使用yfinance的批量下载功能
data = yf.download(
    tickers="00700.HK 09988.HK AAPL",
    period="1y",
    interval="1d",
    group_by='ticker'
)
```

### 缓存机制
```python
import pickle
from functools import lru_cache

@lru_cache(maxsize=100)
def get_cached_stock_data(symbol, period):
    """缓存股票数据"""
    cache_file = f"cache/{symbol}_{period}.pkl"
    if os.path.exists(cache_file):
        with open(cache_file, 'rb') as f:
            return pickle.load(f)
    else:
        data = yf.Ticker(symbol).history(period=period)
        with open(cache_file, 'wb') as f:
            pickle.dump(data, f)
        return data
```

### 并行获取
```python
from concurrent.futures import ThreadPoolExecutor

def fetch_multiple_stocks_parallel(symbols):
    """并行获取多个股票数据"""
    with ThreadPoolExecutor(max_workers=5) as executor:
        results = list(executor.map(self._fetch_single_stock, symbols))
    return {symbol: data for symbol, data in zip(symbols, results) if data is not None}
```

## 安全注意事项

1. **API密钥安全**：不要将API密钥提交到版本控制
2. **数据使用合规**：遵守各数据源的使用条款
3. **隐私保护**：不获取或存储个人隐私信息
4. **访问限制**：合理控制请求频率，避免被封IP

## 更新日志

### v1.0.0 (2026-03-05)
- 初始版本发布
- 支持雅虎财经数据获取
- 支持财务报表获取
- 支持指数数据获取
- 支持宏观经济数据示例
- 完整的配置系统
- 日志记录和错误处理

## 未来计划

### 短期计划
1. 添加更多国内数据源（Tushare、AkShare）
2. 添加实时数据获取功能
3. 完善数据清洗和验证
4. 添加数据质量检查

### 长期计划
1. 构建完整的数据管道
2. 支持机器学习特征工程
3. 添加回测框架集成
4. 开发Web数据仪表盘

## 获取帮助

### 常见问题
1. **安装失败**：确保Python版本>=3.8，使用虚拟环境
2. **数据缺失**：某些股票可能在不同交易所，检查代码格式
3. **网络问题**：检查代理设置，尝试使用国内镜像

### 报告问题
如果遇到问题，请：
1. 查看日志文件 `../logs/data_fetch.log`
2. 检查网络连接和数据源状态
3. 在代码仓库中创建Issue

---
**提示**：首次运行前请确保已安装所有依赖，并正确配置需要获取的股票代码。
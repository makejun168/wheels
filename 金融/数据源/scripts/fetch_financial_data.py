#!/usr/bin/env python3
"""
金融数据获取脚本
用于从多个数据源获取股票、指数、财务数据

作者: Claude Code
创建日期: 2026年3月5日
"""

import os
import sys
import json
import time
import logging
from datetime import datetime, timedelta
from pathlib import Path

# 添加项目根目录到Python路径
project_root = Path(__file__).parent.parent.parent
sys.path.append(str(project_root))

# 第三方库导入
try:
    import yfinance as yf
    import pandas as pd
    import numpy as np
    import requests
    from bs4 import BeautifulSoup
except ImportError as e:
    print(f"缺少必要的库: {e}")
    print("请安装: pip install yfinance pandas numpy requests beautifulsoup4")
    sys.exit(1)

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('金融/数据源/logs/data_fetch.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class FinancialDataFetcher:
    """金融数据获取器"""

    def __init__(self, data_dir="金融/数据源/raw_data"):
        """初始化数据获取器"""
        self.data_dir = Path(data_dir)
        self.data_dir.mkdir(parents=True, exist_ok=True)

        # 创建子目录
        (self.data_dir / "prices").mkdir(exist_ok=True)
        (self.data_dir / "financials").mkdir(exist_ok=True)
        (self.data_dir / "indices").mkdir(exist_ok=True)
        (self.data_dir / "macro").mkdir(exist_ok=True)

        # 配置
        self.config = self._load_config()

    def _load_config(self):
        """加载配置文件"""
        config_path = self.data_dir.parent / "config.json"
        default_config = {
            "api_keys": {},
            "symbols": {
                "港股": ["00700.HK", "09988.HK", "01810.HK"],  # 腾讯、阿里、小米
                "A股": ["000001.SZ", "600000.SH"],
                "美股": ["AAPL", "GOOGL", "MSFT"],
                "指数": ["^HSI", "^HSTECH", "^GSPC"]  # 恒指、恒生科技、标普500
            },
            "data_sources": {
                "yfinance": {"enabled": True, "rate_limit": 2},  # 请求间隔(秒)
                "sina": {"enabled": True},
                "eastmoney": {"enabled": True}
            }
        }

        if config_path.exists():
            with open(config_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        else:
            with open(config_path, 'w', encoding='utf-8') as f:
                json.dump(default_config, f, indent=2, ensure_ascii=False)
            return default_config

    def fetch_stock_prices(self, symbols, period="1y", interval="1d"):
        """
        获取股票价格数据

        Args:
            symbols: 股票代码列表
            period: 时间周期 (1d, 5d, 1mo, 3mo, 6mo, 1y, 2y, 5y, 10y, ytd, max)
            interval: 数据间隔 (1m, 2m, 5m, 15m, 30m, 60m, 90m, 1h, 1d, 5d, 1wk, 1mo, 3mo)

        Returns:
            dict: 各股票的数据框字典
        """
        logger.info(f"开始获取{len(symbols)}只股票的价格数据，周期: {period}")

        results = {}
        for i, symbol in enumerate(symbols):
            try:
                # 遵守API频率限制
                if i > 0 and self.config["data_sources"]["yfinance"]["rate_limit"] > 0:
                    time.sleep(self.config["data_sources"]["yfinance"]["rate_limit"])

                logger.info(f"获取 {symbol} 的数据...")
                ticker = yf.Ticker(symbol)

                # 获取历史数据
                hist = ticker.history(period=period, interval=interval)

                if hist.empty:
                    logger.warning(f"{symbol} 无数据返回")
                    continue

                # 添加元数据
                hist['symbol'] = symbol
                hist['data_source'] = 'yfinance'
                hist['fetch_time'] = datetime.now()

                # 保存到文件
                file_name = f"{symbol.replace('^', '').replace('.', '_')}_{period}.csv"
                file_path = self.data_dir / "prices" / file_name
                hist.to_csv(file_path, encoding='utf-8-sig')

                results[symbol] = hist
                logger.info(f"{symbol}: 获取了{len(hist)}条记录，时间范围: {hist.index[0]} 到 {hist.index[-1]}")

                # 获取基本信息
                info = ticker.info
                info_file = self.data_dir / "prices" / f"{symbol.replace('^', '').replace('.', '_')}_info.json"
                with open(info_file, 'w', encoding='utf-8') as f:
                    json.dump(info, f, indent=2, ensure_ascii=False, default=str)

            except Exception as e:
                logger.error(f"获取 {symbol} 数据失败: {e}")
                continue

        logger.info(f"价格数据获取完成，成功: {len(results)}/{len(symbols)}")
        return results

    def fetch_financial_statements(self, symbols):
        """
        获取财务报表数据

        Args:
            symbols: 股票代码列表

        Returns:
            dict: 各股票的财务数据字典
        """
        logger.info(f"开始获取{len(symbols)}只股票的财务报表")

        results = {}
        for symbol in symbols:
            try:
                ticker = yf.Ticker(symbol)

                # 获取财务报表
                financials = {
                    "income_statement": ticker.income_stmt,
                    "balance_sheet": ticker.balance_sheet,
                    "cash_flow": ticker.cashflow,
                    "financial_ratios": ticker.financials
                }

                # 保存到文件
                symbol_dir = self.data_dir / "financials" / symbol.replace('^', '').replace('.', '_')
                symbol_dir.mkdir(exist_ok=True)

                for statement_name, statement_df in financials.items():
                    if statement_df is not None and not statement_df.empty:
                        file_path = symbol_dir / f"{statement_name}.csv"
                        statement_df.to_csv(file_path, encoding='utf-8-sig')

                results[symbol] = financials
                logger.info(f"{symbol}: 财务报表获取成功")

            except Exception as e:
                logger.error(f"获取 {symbol} 财务报表失败: {e}")
                continue

        return results

    def fetch_index_data(self, index_symbols):
        """
        获取指数数据

        Args:
            index_symbols: 指数代码列表

        Returns:
            dict: 各指数的数据框字典
        """
        logger.info(f"开始获取{len(index_symbols)}个指数数据")

        # 获取指数价格数据
        prices = self.fetch_stock_prices(index_symbols, period="5y", interval="1d")

        # 对于恒生科技指数，尝试获取成分股信息
        if "^HSTECH" in index_symbols:
            self._fetch_hstech_constituents()

        return prices

    def _fetch_hstech_constituents(self):
        """获取恒生科技指数成分股信息"""
        try:
            logger.info("尝试获取恒生科技指数成分股信息")

            # 这里可以添加从恒生指数公司官网或第三方获取成分股信息的代码
            # 目前使用模拟数据
            constituents = [
                {"symbol": "00700.HK", "name": "腾讯控股", "weight": 8.0},
                {"symbol": "09988.HK", "name": "阿里巴巴", "weight": 8.0},
                {"symbol": "03690.HK", "name": "美团-W", "weight": 8.0},
                {"symbol": "01810.HK", "name": "小米集团-W", "weight": 5.0},
                {"symbol": "09888.HK", "name": "百度集团-SW", "weight": 4.0},
                {"symbol": "09618.HK", "name": "京东集团-SW", "weight": 4.0},
                {"symbol": "02020.HK", "name": "安踏体育", "weight": 3.0},
                {"symbol": "00941.HK", "name": "中国移动", "weight": 3.0},
                {"symbol": "02382.HK", "name": "舜宇光学科技", "weight": 2.5},
                {"symbol": "00700.HK", "name": "腾讯控股", "weight": 8.0}
            ]

            # 保存成分股信息
            constituents_file = self.data_dir / "indices" / "hstech_constituents.json"
            with open(constituents_file, 'w', encoding='utf-8') as f:
                json.dump({
                    "index_name": "恒生科技指数",
                    "index_symbol": "HSTECH",
                    "update_date": datetime.now().strftime("%Y-%m-%d"),
                    "constituents": constituents
                }, f, indent=2, ensure_ascii=False)

            logger.info("恒生科技指数成分股信息已保存")

        except Exception as e:
            logger.error(f"获取恒生科技指数成分股失败: {e}")

    def fetch_macro_data(self):
        """获取宏观经济数据"""
        logger.info("开始获取宏观经济数据")

        macro_data = {}

        try:
            # 这里可以添加获取GDP、CPI、PMI等宏观数据的代码
            # 目前创建示例数据文件结构
            macro_dir = self.data_dir / "macro"

            # 创建示例文件
            example_data = {
                "china_gdp": {
                    "2025-Q1": 300000,
                    "2025-Q2": 310000,
                    "2025-Q3": 305000,
                    "2025-Q4": 315000
                },
                "china_cpi": {
                    "2025-01": 2.1,
                    "2025-02": 2.3,
                    "2025-03": 2.0,
                    "2025-04": 2.2
                },
                "us_fed_rate": {
                    "2025-01": 5.25,
                    "2025-02": 5.25,
                    "2025-03": 5.00,
                    "2025-04": 5.00
                }
            }

            for indicator, data in example_data.items():
                df = pd.DataFrame(list(data.items()), columns=['date', 'value'])
                file_path = macro_dir / f"{indicator}.csv"
                df.to_csv(file_path, index=False, encoding='utf-8-sig')

            logger.info("宏观经济数据示例文件已创建")

        except Exception as e:
            logger.error(f"获取宏观经济数据失败: {e}")

        return macro_data

    def fetch_all_data(self):
        """获取所有配置的数据"""
        logger.info("开始获取所有配置的金融数据")

        all_results = {}

        # 获取股票价格数据
        all_symbols = []
        for market, symbols in self.config["symbols"].items():
            all_symbols.extend(symbols)

        # 去重
        all_symbols = list(set(all_symbols))

        # 获取数据
        all_results["prices"] = self.fetch_stock_prices(all_symbols, period="1y")
        all_results["financials"] = self.fetch_financial_statements(all_symbols)
        all_results["indices"] = self.fetch_index_data(self.config["symbols"]["指数"])
        all_results["macro"] = self.fetch_macro_data()

        # 生成数据报告
        self._generate_data_report(all_results)

        logger.info("所有数据获取完成")
        return all_results

    def _generate_data_report(self, all_results):
        """生成数据获取报告"""
        report = {
            "fetch_time": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "summary": {
                "prices_fetched": len(all_results.get("prices", {})),
                "financials_fetched": len(all_results.get("financials", {})),
                "indices_fetched": len(all_results.get("indices", {})),
                "macro_indicators": len(all_results.get("macro", {}))
            },
            "details": {}
        }

        # 价格数据详情
        for symbol, data in all_results.get("prices", {}).items():
            report["details"][symbol] = {
                "data_points": len(data),
                "date_range": f"{data.index[0]} to {data.index[-1]}" if len(data) > 0 else "No data",
                "latest_price": data.iloc[-1]["Close"] if len(data) > 0 else None
            }

        # 保存报告
        report_file = self.data_dir.parent / "reports" / f"data_fetch_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        report_file.parent.mkdir(exist_ok=True)

        with open(report_file, 'w', encoding='utf-8') as f:
            json.dump(report, f, indent=2, ensure_ascii=False, default=str)

        logger.info(f"数据获取报告已保存: {report_file}")

def main():
    """主函数"""
    print("=" * 60)
    print("金融数据获取系统")
    print("=" * 60)

    # 创建数据获取器
    fetcher = FinancialDataFetcher()

    # 获取配置的符号
    config = fetcher.config

    print("\n配置的股票和指数:")
    for market, symbols in config["symbols"].items():
        print(f"  {market}: {', '.join(symbols[:5])}{'...' if len(symbols) > 5 else ''}")

    print("\n请选择操作:")
    print("1. 获取所有数据")
    print("2. 仅获取价格数据")
    print("3. 仅获取财务报表")
    print("4. 仅获取指数数据")
    print("5. 仅获取宏观数据")
    print("6. 测试单个股票 (00700.HK)")

    choice = input("\n请输入选择 (1-6): ").strip()

    if choice == "1":
        fetcher.fetch_all_data()
    elif choice == "2":
        all_symbols = []
        for symbols in config["symbols"].values():
            all_symbols.extend(symbols)
        fetcher.fetch_stock_prices(list(set(all_symbols)))
    elif choice == "3":
        all_symbols = []
        for market, symbols in config["symbols"].items():
            if market != "指数":  # 指数没有财务报表
                all_symbols.extend(symbols)
        fetcher.fetch_financial_statements(list(set(all_symbols)))
    elif choice == "4":
        fetcher.fetch_index_data(config["symbols"]["指数"])
    elif choice == "5":
        fetcher.fetch_macro_data()
    elif choice == "6":
        fetcher.fetch_stock_prices(["00700.HK"], period="6mo")
        fetcher.fetch_financial_statements(["00700.HK"])
    else:
        print("无效选择，使用默认选项1")
        fetcher.fetch_all_data()

    print("\n数据获取完成！")
    print(f"数据保存在: {fetcher.data_dir}")

if __name__ == "__main__":
    main()
import getopt
import time

import requests
import json
import sys
from logzero import logger

defaultToken = "8ced55ddb30432342e56de9fdace7df3f6b92ebdb10ad866d69783c21979ed5f69cf8a4986ad36d15550493687d3a14063a5a72d12e581cff9bbe3932a624bc5b51bb3790e14df238597684876b37a5cc94a0bd37add5ce3fc9a38c647219e4e"


def sendNotification(text, interval: float = 30.0, count: int = 1, token=defaultToken):
    """

    :param text:  发送的文本
    :param interval:  间隔多长时间发送
    :param count:  发送次数
    :param token:
    :return:
    """

    for cnum in range(count):
        logger.info(f"发送跑马灯 {text}  -  第 {cnum + 1} 次")

        reps = requests.post(
            url="http://gmt-admin.xk5.com/api/gdis/console/game/SGXQ/notification",
            headers={
                "authorization": token
            },
            data=json.dumps(
                {
                    "TargetPlatform": "ALL",
                    "TargetServer": "",
                    "TargetGameId": "sgxq",
                    "SendMessage": json.dumps({
                        "text": text,
                        "option": {
                            "display_cnt": 1,
                            "zone_type": ["ALL"]
                        }
                    })
                }
            )
        )
        if reps.json().get("code") == 0:
            logger.info("发送成功")
        else:
            logger.error("发送失败 请注意。")

        if cnum < count - 1:
            time.sleep(interval)  # 休眠间隔

    logger.info("发送脚本完成。 ")
    return


if __name__ == '__main__':

    opts, args = getopt.getopt(sys.argv[1:], "-h-v:-i:-c:-t:",
                               ["help", "value=", "interval=", "count=", "token="])

    value, interval, count, token = "", 30, 1, defaultToken

    tag = False
    for opt, arg in opts:
        if opt in ["-h", "--help"]:
            print(
                """
    通过 -h 或 --help 查看帮助文档

    通过 -v 或 --value 设置发送的文本
    通过 -i 或 --interval 设置两次跑马灯的间隔
    通过 -c 或 --count 设置发送次数
    通过 -t 或 --token 配置token
                """
            )
            tag = True
        elif opt in ["-v", "--value"]:
            value = arg
            if len(value) < 30:
                tag = True
                logger.error(f"跑马灯内容不足30字。 size {len(value)} value {value}")
        elif opt in ["-i", "--interval"]:
            try:
                interval = float(arg)
                logger.info(f"发送间隔: {interval}")
            except Exception as e:
                logger.error(e)
                logger.error("请输入正确的发送间隔， 应该可以是浮点数也可以是整数，单位为秒，如30秒则 [-i 30]")
                tag = True
        elif opt in ["-c", "--count"]:
            try:
                count = int(arg)
                logger.info(f"发送次数: {count}")
            except Exception as e:
                logger.error(e)
                logger.error("请输入正确的发送次数， 应该可以是整数，单位为次，如30次则 [-c 30]")
        elif opt in ["-t", "--token"]:
            token = arg
            logger.info(f"token: {token}")
        else:
            raise Exception(f"异常的参数 {opt}")

    if tag:
        sys.exit()

    sendNotification(value, interval, count, token)

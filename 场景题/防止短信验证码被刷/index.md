### 防止短信验证码被刷

### 如何防止短信验证码被刷掉

1. **限制发送频率**  
    设置每个手机号在一定时间内只能发送有限次数的验证码。例如，每个手机号每分钟只能请求一次验证码。  
    ```python
    from datetime import datetime, timedelta

    request_log = {}

    def can_send_sms(phone_number):
         now = datetime.now()
         if phone_number in request_log:
              last_request_time = request_log[phone_number]
              if now - last_request_time < timedelta(minutes=1):
                    return False
         request_log[phone_number] = now
         return True
    ```

2. **图片验证码**  
    在发送短信验证码之前，要求用户完成图片验证码验证，防止自动化脚本滥用。  
    ```html
    <form action="/send_sms" method="POST">
         <img src="/captcha" alt="Captcha">
         <input type="text" name="captcha" placeholder="Enter Captcha">
         <button type="submit">Send SMS</button>
    </form>
    ```

3. **IP 限制**  
    对同一 IP 地址的请求进行限制，防止单个 IP 地址频繁请求验证码。  
    ```python
    ip_request_count = {}

    def is_ip_allowed(ip_address):
         if ip_address not in ip_request_count:
              ip_request_count[ip_address] = 0
         if ip_request_count[ip_address] >= 5:
              return False
         ip_request_count[ip_address] += 1
         return True
    ```

4. **行为分析**  
    使用机器学习或规则引擎分析用户行为，识别异常请求并阻止。  
    例如，检测到某个用户在短时间内频繁更换手机号请求验证码，可以直接封禁该用户。

通过以上方法，可以有效防止短信验证码被刷掉，减少资源浪费和成本损失。
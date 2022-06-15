module.exports = function xhrAdapter(config) {
    return new Promise(function dispatchXhrRequest(resolve, reject) {

        var request = new XMLHttpRequest();


        request.open('POST', 'https://baidu.com', true);

        function onloadend() {
            if (!request) {
                return;
            }
            // Prepare the response
            var responseHeaders = 'getAllResponseHeaders' in request ? parseHeaders(request.getAllResponseHeaders()) : null;
            var responseData = !responseType || responseType === 'text' ||  responseType === 'json' ?
                request.responseText : request.response;
            var response = {
                data: responseData,
                status: request.status,
                statusText: request.statusText,
                headers: responseHeaders,
                config: config,
                request: request
            };

            // Clean up request
            request = null;
        }

        if ('onloadend' in request) {
            // Use onloadend if available
            request.onloadend = onloadend;
        } else {
            // Listen for ready state to emulate onloadend
            request.onreadystatechange = function handleLoad() {
                if (!request || request.readyState !== 4) {
                    return;
                }

                // The request errored out and we didn't get a response, this will be
                // handled by onerror instead
                // With one exception: request that using file: protocol, most browsers
                // will return status as 0 even though it's a successful request
                if (request.status === 0 && !(request.responseURL && request.responseURL.indexOf('file:') === 0)) {
                    return;
                }
                // readystate handler is calling before onerror or ontimeout handlers,
                // so we should call onloadend on the next 'tick'
                setTimeout(onloadend);
            };
        }


        // Set the request timeout in MS
        request.timeout = 500;

        // Handle browser request cancellation (as opposed to a manual cancellation)
        request.onabort = function handleAbort() {
            if (!request) {
                return;
            }

            reject('某个错误');

            // Clean up request
            request = null;
        };

        // Handle low level network errors
        request.onerror = function handleError() {
            // Real errors are hidden from us by the browser
            // onerror should only fire if it's a network error
            reject('某个错误');

            // Clean up request
            request = null;
        };

        // Handle timeout
        request.ontimeout = function handleTimeout() {

            reject('某个错误');

            // Clean up request
            request = null;
        };


        // Send the request
        request.send(requestData);
    });
};

function myJsonp(options) {
    return new Promise((resolve, reject) => {
        //判断是否是第一次jsonp请求
        if (!window.jsonpNum) {
            window.jsonpNum = 1
        } else {
            window.jsonpNum++
        }

        let {
            url,
            data,
            timeout = 5000,
            cbkey = 'callback',
        } = options

        //保证每次请求接收的方法都不会重复
        let funName = 'jsonpReceive' + window.jsonpNum

        //清除本次jsonp请求产生的一些无用东西
        function clear() {
            window[funName] = null
            script.parentNode.removeChild(script);
            clearTimeout(timer)
        }

        //定义jsonp接收函数
        window[funName] = function(res) {
            //一旦函数执行了，就等于说请求成功了
            resolve(res)
            clear()
        }

        //请求超时计时器
        let timer = setTimeout(() => {
            reject('超时了')
            clear()
        }, timeout)

        //定义请求的参数
        let params = ''

        //如果有参数
        if (Object.keys(data).length) {
            for (let key in data) {
                params += `&${key}=${encodeURIComponent(data[key])}`;
            }

            params = params.substr(1)
        }

        //拼接最终的请求路径，结尾拼接回调的方法名
        url = url + '?' + params + `&${cbkey}=${funName}`

        let script = document.createElement('script');
        script.src = url;
        document.body.appendChild(script);
    })
}

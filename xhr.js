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

            reject('????????????');

            // Clean up request
            request = null;
        };

        // Handle low level network errors
        request.onerror = function handleError() {
            // Real errors are hidden from us by the browser
            // onerror should only fire if it's a network error
            reject('????????????');

            // Clean up request
            request = null;
        };

        // Handle timeout
        request.ontimeout = function handleTimeout() {

            reject('????????????');

            // Clean up request
            request = null;
        };


        // Send the request
        request.send(requestData);
    });
};

function myJsonp(options) {
    return new Promise((resolve, reject) => {
        //????????????????????????jsonp??????
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

        //????????????????????????????????????????????????
        let funName = 'jsonpReceive' + window.jsonpNum

        //????????????jsonp?????????????????????????????????
        function clear() {
            window[funName] = null
            script.parentNode.removeChild(script);
            clearTimeout(timer)
        }

        //??????jsonp????????????
        window[funName] = function(res) {
            //???????????????????????????????????????????????????
            resolve(res)
            clear()
        }

        //?????????????????????
        let timer = setTimeout(() => {
            reject('?????????')
            clear()
        }, timeout)

        //?????????????????????
        let params = ''

        //???????????????
        if (Object.keys(data).length) {
            for (let key in data) {
                params += `&${key}=${encodeURIComponent(data[key])}`;
            }

            params = params.substr(1)
        }

        //????????????????????????????????????????????????????????????
        url = url + '?' + params + `&${cbkey}=${funName}`

        let script = document.createElement('script');
        script.src = url;
        document.body.appendChild(script);
    })
}

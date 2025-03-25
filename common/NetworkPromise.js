// Just useful for Greasemonkey/Tampermonkey/etc script engines.
// This wraps the GM_xmlhttpRequest functionality in a promise, and provides
// a few useful error exceptions that will automatically reject the promise on
// results other than 200.

class NetworkError extends Error {
    constructor(response) {
        super('Some kind of network error happened requesting ' + response.url);
        this.name = 'NetworkError';
        this.response = response;
    }
}


class HttpError extends Error {
    constructor(response) {
        super(response.status + ' for ' + response.url);
        this.name = 'HttpError';
        this.response = response;
    }
}


class TimeoutError extends Error {
    constructor(response) {
        super('Timeout for ' + response.url);
        this.name = 'TimeoutError';
        this.response = response;
    }
}

function GM_xmlhttpRequestPromise(data) {
    // Data can have a special parameter preventredirect to throw an error if
    // final URL doesn't match initial URL (since there's no actual way to block
    // redirections with XMLHttpRequest)
    return new Promise((resolve, reject) => {
        // Match old callback functions to Promise resolve/reject
        data.onload = (response) => {
            if (data.preventredirect === true && data.url !== response.finalUrl) {
                response.url = data.url;
                response.status = 302;
                reject(new HttpError(response));
            } else if (response.status === 200) {
                resolve(response);
            } else {
                // Apparently errors >= 400 do not count to trigger onerror
                response.url = response.finalUrl;
                reject(new HttpError(response));
            }
        }
        data.ontimeout = (response) => {
            // Apparently Tampermonkey provides no response element for ontimeout
            response.url = data.url;
            reject(new TimeoutError(response));
        }
        data.onerror = (response) => {
            // Seems this is only triggered by network errors
            response.url = response.finalUrl;
            reject(new NetworkError(response));
        }

        GM_xmlhttpRequest(data);
    });
}

/**
 * utility method to handle a response body that is a JSON-encoded object.
 *
 * @param response -
 *            the HTTP response object returned from the call
 * @param withResponseBody -
 *            a function that takes a single argument, the JSON-parsed response
 *            body
 */
exports.handleJsonBody = function(response, withResponseBody) {
    var buffers = [];
    response.on("data", function (chunk) {
        buffers.push(chunk);
    });
    response.on("end", function () {
        withResponseBody(JSON.parse(Buffer.concat(buffers).toString("utf8")));
    });
};

exports.parseUrlForParams = function(query, params) {
    var options = {};
    if (params === undefined) {
        return options;
    }

    for (var i = 0; i < params.length; i++) {
        options[params[i]] = query[params[i]];
    }

    return options;
};


'use strict';

module.exports = function isLocal(url) {
    return url.indexOf('https://') !== 0;
};

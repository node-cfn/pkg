'use strict';

module.exports = function isLocal(url) {
    return url && url.indexOf('https://') !== 0;
};
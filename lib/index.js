"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs2/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = watchBrowserFetch;

var _objectSpread2 = _interopRequireDefault(require("@babel/runtime-corejs2/helpers/objectSpread"));

var _now = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/date/now"));

var _promise = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/promise"));

function checkStatus(response) {
  if (response.status >= 200 && response.status < 300) {
    return response;
  }

  var error = new Error(response.statusText);
  error.response = response;
  return _promise.default.reject(error);
}

function watch() {
  var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
      _ref$parser = _ref.parser,
      parser = _ref$parser === void 0 ? function () {} : _ref$parser,
      _ref$config = _ref.config,
      config = _ref$config === void 0 ? {} : _ref$config;

  var fetchOption;
  var request;
  return {
    watchBefore: function watchBefore() {
      var originBefore = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : function () {};
      return function before(option) {
        fetchOption = option;
        originBefore();
      };
    },
    watchCache: function watchCache() {
      var originCache = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : function () {};
      return function hackCache(url, option) {
        request = {
          url: url,
          option: option
        };
        return originCache();
      };
    },
    watchAfter: function watchAfter() {
      var originAfter = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : function () {};
      return function after(startTime) {
        return function parseData(response) {
          parser({
            startTime: startTime,
            endTime: +(0, _now.default)(),
            fetchOption: fetchOption,
            request: request,
            response: response.clone()
          }, config);
          return originAfter(response);
        };
      };
    },
    watchException: function watchException() {
      var originException = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : function () {};
      return function after(startTime) {
        return function exception(e) {
          parser({
            startTime: startTime,
            endTime: +(0, _now.default)(),
            fetchOption: fetchOption,
            request: request,
            response: undefined,
            exception: e
          }, config);
          return originException(e);
        };
      };
    }
  };
}

function watchBrowserFetch(fetchApi) {
  var watchConfig = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var fetch = fetchApi.fetch;

  fetchApi.fetch = function watchFetch(options) {
    var _watch = watch(watchConfig),
        watchBefore = _watch.watchBefore,
        watchAfter = _watch.watchAfter,
        watchCache = _watch.watchCache,
        watchException = _watch.watchException;

    return fetch.call((0, _objectSpread2.default)({}, this, {
      before: watchBefore(this.before),
      cache: watchCache(this.cache),
      checkStatus: watchAfter(this.checkStatus || checkStatus)(+(0, _now.default)()),
      exception: watchException(this.exception)(+(0, _now.default)())
    }), options);
  };

  return fetchApi;
}

//# sourceMappingURL=index.js.map

function checkStatus(response) {
  if (response.status >= 200 && response.status < 300) {
    return response;
  }
  const error = new Error(response.statusText);
  error.response = response;
  return Promise.reject(error);
}


function watch(
  {
    parser = () => {},
    config = {},
  } = {}
) {
  let fetchOption;
  let request;
  return {
    watchBefore(originBefore = () => {}) {
      return function before(option) {
        fetchOption = option;
        originBefore(fetchOption);
      };
    },
    watchCache(originCache = () => {}) {
      return function hackCache(url, option) {
        request = { url, option };
        return originCache(fetchOption);
      };
    },
    watchAfter(originAfter = () => {}) {
      return function after(startTime) {
        return function parseData(response) {
          parser({
            startTime,
            endTime: +Date.now(),
            fetchOption,
            request,
            response: response.clone(),
          }, config);
          
          return originAfter(response);
        };
      };
    },
    watchException(originException = () => {}) {
      return function after(startTime) {
        return function exception(e) {
          parser({
            startTime,
            endTime: +Date.now(),
            fetchOption,
            request,
            response: undefined,
            exception: e,
          }, config);
          
          return originException(e);
        };
      }
    }
  };
}



export default function watchBrowserFetch(fetchApi, watchConfig = {}) {
  const { fetch } = fetchApi;
  
  fetchApi.fetch = function watchFetch(options) {
    const { watchBefore, watchAfter, watchCache, watchException } = watch(watchConfig);
    
    return fetch.call({
      ...this,
      before: watchBefore(this.before),
      cache: watchCache(this.cache),
      checkStatus: watchAfter(this.checkStatus || checkStatus)(+Date.now()),
      exception: watchException(this.exception)(+Date.now()),
    }, options);
  };
  
  return fetchApi;
}


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
        originBefore();
      };
    },
    watchCache(originCache = () => {}) {
      return function hackCache(url, option) {
        request = { url, option };
        return originCache();
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
  };
}



export default function watchBrowserFetch(fetchApi, watchConfig = {}) {
  const { fetch } = fetchApi;
  
  fetchApi.fetch = function watchFetch(options) {
    const { watchBefore, watchAfter, watchCache } = watch(watchConfig);
    
    return fetch.call({
      ...this,
      before: watchBefore(this.before),
      cache: watchCache(this.cache),
      checkStatus: watchAfter(this.checkStatus || checkStatus)(+Date.now()),
    }, options);
  };
  
  
  return fetchApi;
}

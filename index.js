
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
  let request;
  return {
    watchBefore(originBefore = () => {}) {
      return function before(option) {
        request = option;
        originBefore();
      };
    },
    watchAfter(originAfter = () => {}) {
      return function after(startTime) {
        return function parseData(response) {
          parser({ startTime, endTime: +Date.now(), request, response: response.clone() }, config);
          return originAfter(response);
        };
      };
    },
  };
}

export default function watchBrowserFetch(fetchApi, watchConfig = {}) {
  const newFetchApi = Object.create(fetchApi);
  
  newFetchApi.fetch = function watchFetch(options) {
    const { watchBefore, watchAfter } = watch(watchConfig);
    
    return fetchApi.fetch.call({
      ...this,
      before: watchBefore(this.before),
      checkStatus: watchAfter(this.checkStatus || checkStatus)(+Date.now()),
    }, options);
  };
  
  return newFetchApi;
}

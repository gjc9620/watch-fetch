# react-string-template
react-string-template is simple string template with react

## install
`npm i --save watch-fech`


``` js

  watchedFetchAPI = watchFetch(
    new FetchAPI({
      middlewares: [],
    }),
    {
      parser: (performance, config) => {
        const { startTime, endTime, request, response } = performance;
        const { a, b } = config;
        console.log(performance);
      },
      config: {
        a: 1,
        b: 2,
      },
    }
  )

```


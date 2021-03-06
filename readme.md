This is a working test implementation of recursively fetching and transforming paginated data from the Google Cloud Storage API.

We've been doing it the "old way" since the beginning, but recently I [started wondering](https://github.com/GoogleCloudPlatform/gcloud-node/issues/802) if we could do it better. I explain the different techniques below, and I've asked some [questions](https://github.com/stephenplusplus/gcloud-streams-test/issues/1) I hope you can take a look at.

Thank you very much!

#### The Techniques
  1. **[Old](1-old-way.js)** - This is the way we do it currently in [gcloud](https://github.com/googlecloudplatform/gcloud-node). We make an API request, and from the entire response, we iterate over each result and push it onto the user's stream.

  2. **[New](2-new-way.js)** - This makes a streaming request, pipes it to JSONStream to parse for the results we need, using [continue-stream](http://gitnpm.com/continue-stream) to handle pagination.

### The Tests
I found that speed is nothing to worry about measuring. When testing with both a mock server and the actual backend, all of the tests performed within a reasonable amount of time. I became more conerned with the memory usage and the overhead of assembling many streams (new way) as opposed to one (old way).

Anytime the `process.memoryUsage().heapUsed` value changes, its value is printed along with how many results have been processed at that time.

  - `npm start` - Start the server.
  - `npm run all` - Run all of the tests in series.
  - `npm run old` - Run the old style.
  - `npm run new` - Run the new style.

### Results
```sh
> npm run all

> gcloud-stream-tests@1.0.0 all /Users/stephen/dev/gcloud-stream-experiment
> npm run old && npm run new


> gcloud-stream-tests@1.0.0 old /Users/stephen/dev/gcloud-stream-experiment
> ./runner.js old

Starting old
-1 mb 1 results handled
0 mb 44 results handled
1 mb 101 results handled
2 mb 157 results handled
3 mb 230 results handled
old completed in 3.067 seconds

> gcloud-stream-tests@1.0.0 new /Users/stephen/dev/gcloud-stream-experiment
> ./runner.js new

Starting new
3 mb 1 results handled
5 mb 30 results handled
6 mb 88 results handled
2 mb 101 results handled
3 mb 104 results handled
5 mb 130 results handled
6 mb 190 results handled
1 mb 201 results handled
2 mb 215 results handled
3 mb 230 results handled
4 mb 259 results handled
new completed in 3.161 seconds
```

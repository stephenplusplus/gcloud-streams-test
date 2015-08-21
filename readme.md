This is a working test implementation of recursively fetching and transforming paginated data from the Google Cloud Storage API.

#### The Techniques

  1. **Old** - This is the way we do it currently in gcloud. We make an API request, we get the entire response, then iterate over each result and push it onto the user's stream.

  2. **New** - This makes a streaming request, pipes it to JSONStream to parse for the results we need.

  3. **Paginated** - Mid-way through making "New", I found [continue-stream](https://github.com/timhudson/continue-stream). I thought I should give it a shot instead of re-inventing the wheel.

### The Tests

I found that speed is nothing to worry about measuring. When testing with both a mock server and the actual backend, all of the tests performed within a reasonable amount of time. I became more conerned with the memory usage and the overhead of assembling many streams (techniques 2 & 3) as opposed to one (technique 1).

Before a request goes out, the `process.memoryUsage().heapUsed` value is printed.

  - `npm start` - Start the server.
  - `npm run all` - Run all of the tests in series.
  - `npm run old` - Run the old style.
  - `npm run new` - Run the new style.
  - `npm run paginated` - Run the test using continue-stream.

### Results
```sh
> npm run all

> gcloud-stream-tests@1.0.0 all /Users/stephen/dev/play/gcloud-stream-experiment
> npm run old && npm run new && npm run paginated


> gcloud-stream-tests@1.0.0 old /Users/stephen/dev/play/gcloud-stream-experiment
> ./runner.js old

Starting old
0 mb
1 mb
2 mb
2 mb
0 mb
0 mb
0 mb
1 mb
1 mb
1 mb
2 mb
old completed in 11.114 seconds

> gcloud-stream-tests@1.0.0 new /Users/stephen/dev/play/gcloud-stream-experiment
> ./runner.js new

Starting new
0 mb
0 mb
2 mb
3 mb
5 mb
6 mb
7 mb
8 mb
2 mb
3 mb
4 mb
new completed in 11.192 seconds

> gcloud-stream-tests@1.0.0 paginated /Users/stephen/dev/play/gcloud-stream-experiment
> ./runner.js paginated

Starting paginated
0 mb
0 mb
2 mb
3 mb
4 mb
5 mb
6 mb
8 mb
1 mb
2 mb
3 mb
paginated completed in 11.186 seconds
```

### Questions

  1. Is this so wrong, I should just stop?

  2. The API returns a JSON response that may contain either of the following:

    1. An `errors` array.

    2. An `items` array.

  Is branching off two response streams to get a nextPageToken and errors the wrong way to snip out just a piece of the response? Is there a lot of overhead?

  3. Is calling `dup.setReadable()` after already setting the readable going to have any unwanted side effects?

I'm so thankful for any help and happy to answer questions about this!
This is a working test implementation of recursively fetching and transforming paginated data from the Google Cloud Storage API.

#### The Techniques

  1. **Old** - This is the way we do it currently in gcloud. We make an API request, we get the entire response, then iterate over each result and push it onto the user's stream.

  2. **New** - This makes a streaming request, pipes it to JSONStream to parse for the results we need, using [continue-stream](http://gitnpm.com/continue-stream) to handle pagination.

### The Tests

I found that speed is nothing to worry about measuring. When testing with both a mock server and the actual backend, all of the tests performed within a reasonable amount of time. I became more conerned with the memory usage and the overhead of assembling many streams (new way) as opposed to one (old way).

Anytime the `process.memoryUsage().heapUsed` value changes, its value is printed along with how many results have been processed at that time.

  - `npm start` - Start the server.
  - `npm run all` - Run both of the tests in series.
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

### Questions

  1. Is this so wrong, I should just stop?

  2. The API returns a JSON response that may contain either of the following:

    1. An `errors` array.

    2. An `items` array.

  Is branching off two response streams to get a nextPageToken and errors the wrong way to snip out just a piece of the response? Is there a lot of overhead?

I'm so thankful for any help and happy to answer questions about this!

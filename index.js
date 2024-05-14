const fetch = require("node-fetch");

async function fetchUrlsInBatches(urls, maxConcurrency) {
  let index = 0;
  const results = new Array(urls.length).fill(undefined);
  const executing = new Set();

  const queue = async () => {
    while (index < urls.length) {
      if (executing.size >= maxConcurrency) {
        console.log(
          `Max concurrency reached, waiting for one fetch to complete.`
        );
        await Promise.race(executing);
      }

      const urlIndex = index++;
      const url = urls[urlIndex];
      if (!url) {
        console.error(`Invalid URL at index ${urlIndex}: ${url}`);
        continue;
      }

      console.log(
        `Fetching URL at index: ${urlIndex} - ${url} - Active fetches: ${executing.size}`
      );

      const responsePromise = fetch(url)
        .then((response) => response.json())
        .then((data) => {
          results[urlIndex] = data;
        })
        .catch((error) => {
          console.error(`Fetch error for URL ${url}:`, error.message);
          results[urlIndex] = { error: error.message };
        })
        .finally(() => {
          executing.delete(responsePromise);
          console.log(`Completed fetch for URL at index: ${urlIndex}`);
        });

      executing.add(responsePromise);
    }
  };

  await Promise.all(Array.from({ length: maxConcurrency }, () => queue()));
  await Promise.all(executing);
  return results;
}

module.exports = fetchUrlsInBatches;

const urls = [
  "https://jsonplaceholder.typicode.com/todos/1",
  "https://jsonplaceholder.typicode.com/todos/2",
  "https://jsonplaceholder.typicode.com/todos/3",
  "https://jsonplaceholder.typicode.com/todos/4",
  "https://jsonplaceholder.typicode.com/todos/5",
  "https://jsonplaceholder.typicode.com/todos/6",
  "https://jsonplaceholder.typicode.com/todos/7",
  "https://jsonplaceholder.typicode.com/todos/8",
  "https://jsonplaceholder.typicode.com/todos/9",
  "https://jsonplaceholder.typicode.com/todos/10",
];

if (process.env.NODE_ENV !== "test") {
  fetchUrlsInBatches(urls, 2)
    .then((results) => {
      console.log("All fetched data:", results);
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
    });
}

const fetchUrlsInBatches = require("./index");

describe("fetchUrlsInBatches", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    fetch.resetMocks();
  });

  it("fetches data in batches and returns the correct data", async () => {
    fetch.mockResponses(
      [JSON.stringify({ id: 1, name: "Test Todo" }), { status: 200 }],
      [JSON.stringify({ id: 2, name: "Test Todo" }), { status: 200 }],
      [JSON.stringify({ id: 3, name: "Test Todo" }), { status: 200 }],
      [JSON.stringify({ id: 4, name: "Test Todo" }), { status: 200 }],
      [JSON.stringify({ id: 5, name: "Test Todo" }), { status: 200 }],
      [JSON.stringify({ id: 6, name: "Test Todo" }), { status: 200 }]
    );
  
    const urls = [
      "https://jsonplaceholder.typicode.com/todos/1",
      "https://jsonplaceholder.typicode.com/todos/2",
      "https://jsonplaceholder.typicode.com/todos/3",
      "https://jsonplaceholder.typicode.com/todos/4",
      "https://jsonplaceholder.typicode.com/todos/5",
      "https://jsonplaceholder.typicode.com/todos/6",
    ];
    const results = await fetchUrlsInBatches(urls, 2);
  
    expect(results).toEqual([
      { id: 1, name: "Test Todo" },
      { id: 2, name: "Test Todo" },
      { id: 3, name: "Test Todo" },
      { id: 4, name: "Test Todo" },
      { id: 5, name: "Test Todo" },
      { id: 6, name: "Test Todo" }
    ]);
    expect(fetch).toHaveBeenCalledTimes(urls.length);
  });
  
  it("should handle fetch errors correctly", async () => {
    fetch
      .mockResponseOnce(JSON.stringify({ id: 1, name: "Test Todo" }))
      .mockRejectOnce(new Error("Network error"));

    const urls = [
      "https://jsonplaceholder.typicode.com/todos/1",
      "https://jsonplaceholder.typicode.com/todos/2",
    ];

    const results = await fetchUrlsInBatches(urls, 2);

    expect(results[0]).toEqual({ id: 1, name: "Test Todo" });
    expect(results[1]).toMatchObject({ error: "Network error" });
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it("should handle empty URL list", async () => {
    const results = await fetchUrlsInBatches([], 2);
    expect(results).toEqual([]);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("should handle concurrency limits higher than URL count", async () => {
    fetch.mockResponses(
      [JSON.stringify({ id: 1, name: "Test Todo" }), { status: 200 }],
      [JSON.stringify({ id: 2, name: "Test Todo" }), { status: 200 }]
    );

    const urls = [
      "https://jsonplaceholder.typicode.com/todos/1",
      "https://jsonplaceholder.typicode.com/todos/2",
    ];

    const results = await fetchUrlsInBatches(urls, 10);
    expect(results.length).toBe(2);
    expect(fetch).toHaveBeenCalledTimes(2);
  });
});

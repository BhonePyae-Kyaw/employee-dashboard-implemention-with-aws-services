import memjs from "memjs";

let client;

function getClient() {
  if (!client && process.env.CACHE_ENDPOINT) {
    client = memjs.Client.create(process.env.CACHE_ENDPOINT, {
      timeout: 0.5,
      conntimeout: 1,
      retries: 1,
      logger: { log: () => {} },
    });
  }
  return client;
}

// Cache failures are logged and treated as a miss so the API still works from RDS.
export async function cacheGet(key) {
  try {
    const { value } = (await getClient()?.get(key)) ?? {};
    return value ? JSON.parse(value.toString()) : null;
  } catch (err) {
    console.warn("Cache get failed:", err.message);
    return null;
  }
}

export async function cacheSet(key, data, ttlSeconds) {
  try {
    await getClient()?.set(key, JSON.stringify(data), { expires: ttlSeconds });
  } catch (err) {
    console.warn("Cache set failed:", err.message);
  }
}

export async function cacheDelete(key) {
  try {
    await getClient()?.delete(key);
  } catch (err) {
    console.warn("Cache delete failed:", err.message);
  }
}

// Cloudflare Worker: WaySpot API Proxy & Cache

const API_BASE = "https://api.wayspot.app";
const CACHE_TTL = 300;

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
          "Access-Control-Max-Age": "86400"
        }
      });
    }

    const cacheable = request.method === "GET" &&
      (url.pathname.startsWith("/api/discover") ||
       url.pathname.startsWith("/api/businesses/"));

    const cacheKey = new Request(url.toString(), request);
    const cache = caches.default;

    if (cacheable) {
      const cached = await cache.match(cacheKey);
      if (cached) {
        const response = new Response(cached.body, cached);
        response.headers.set("CF-Cache-Status", "HIT");
        return response;
      }
    }

    const apiUrl = new URL(url.pathname + url.search, API_BASE);
    const modifiedRequest = new Request(apiUrl, {
      method: request.method,
      headers: request.headers,
      body: request.body
    });

    const response = await fetch(modifiedRequest);

    const modifiedResponse = new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: {
        ...Object.fromEntries(response.headers),
        "Access-Control-Allow-Origin": "*"
      }
    });

    if (cacheable && response.status === 200) {
      ctx.waitUntil(cache.put(cacheKey, modifiedResponse.clone()));
      modifiedResponse.headers.set("CF-Cache-Status", "MISS");
    }

    return modifiedResponse;
  }
};

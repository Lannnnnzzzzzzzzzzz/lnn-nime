export async function onRequest(context) {
  const url = new URL(context.request.url);

  const targetUrl = new URL(url.pathname, "https://www.sankavollerei.com");

  targetUrl.search = url.search;

  const newRequest = new Request(targetUrl, context.request);

  newRequest.headers.set("Origin", "https://lnn-nime.vercel.app");
  newRequest.headers.set("Referer", "https://lnn-nime.vercel.app/");
  newRequest.headers.set(
    "User-Agent",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
  );

  const response = await fetch(newRequest);

  return response;
}

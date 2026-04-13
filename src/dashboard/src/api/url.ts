const hereUrl = new URL(window.location.href);
const BASE_URL =
  hereUrl.origin.includes("localhost") || hereUrl.origin.includes("127.0.0.1")
    ? "http://localhost:8080/api"
    : "/api";

export function url(path: string): string {
  return `${BASE_URL}${path}`;
}

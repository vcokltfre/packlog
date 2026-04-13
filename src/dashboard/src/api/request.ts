import { url } from "./url";

export async function request(
  method: string,
  path: string,
  init?: RequestInit,
  authenticated = true,
): Promise<Response> {
  let token: string;

  if (authenticated) {
    let tok = localStorage.getItem("authToken");
    if (!tok) {
      throw new Error("No auth token found. Please log in.");
    }

    token = tok;
  } else {
    token = "";
  }

  const response = await fetch(url(path), {
    method,
    credentials: "include",
    ...init,
    headers: {
      ...init?.headers,
      Authorization: token,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Request failed with status ${response.status}: ${errorText}`,
    );
  }

  return response;
}

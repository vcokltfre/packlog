import { request } from "./request";
import { url } from "./url";

export { url };

export async function checkSession(): Promise<boolean> {
  try {
    await request("POST", "/users/check-session");
    return true;
  } catch (error) {
    return false;
  }
}

export async function startSession(): Promise<void> {
  const username = localStorage.getItem("username");
  const password = localStorage.getItem("password");

  if (!username || !password) {
    throw new Error("No username or password found in local storage.");
  }

  const resp = await request(
    "POST",
    "/users/start-session",
    {
      body: JSON.stringify({ username, password }),
      headers: { "Content-Type": "application/json" },
    },
    false,
  );
  const data = await resp.json();

  localStorage.setItem("authToken", data.token);
}

export async function getSelf(): Promise<{ username: string }> {
  const resp = await request("GET", "/users/@self");
  return await resp.json();
}

export type Packlog = {
  date: string;
  tandems: number;
  instructor: number;
  blue_ticket: number;
  pink_ticket: number;
  kit_hire: number;
};

export async function getPacklog(date: string): Promise<Packlog> {
  const resp = await request("GET", `/packlogs/${date}`);
  return await resp.json();
}

export async function getPacklogsBetween(
  startDate: string,
  endDate: string,
): Promise<Packlog[]> {
  const resp = await request(
    "GET",
    `/packlogs/between/${startDate}/${endDate}`,
  );
  return await resp.json();
}

export async function setPacklog(
  date: string,
  packlog: Packlog,
): Promise<void> {
  await request(
    "PUT",
    `/packlogs/${date}`,
    {
      body: JSON.stringify(packlog),
      headers: { "Content-Type": "application/json" },
    },
    true,
  );
}

export async function getInvites(): Promise<
  { code: string; username: string }[]
> {
  const resp = await request("GET", "/invites");
  return await resp.json();
}

export async function createInvite(username: string): Promise<string> {
  const resp = await request("POST", "/invites?username=" + username);
  const data = await resp.json();
  return data.code;
}

export async function acceptInvite(
  code: string,
  password: string,
): Promise<void> {
  await request(
    "POST",
    `/invites/${code}/accept`,
    {
      body: JSON.stringify({ password }),
      headers: { "Content-Type": "application/json" },
    },
    false,
  );
}

export async function deleteInvite(code: string): Promise<void> {
  await request("DELETE", `/invites/${code}`);
}

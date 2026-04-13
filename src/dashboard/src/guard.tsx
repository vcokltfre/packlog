import { useLocation } from "@solidjs/router";
import {
  createEffect,
  createSignal,
  JSX,
  on,
  ParentProps,
  Show,
} from "solid-js";
import { checkSession, startSession, url } from "./api";

export function AuthGuard(props: ParentProps): JSX.Element {
  const [authenticated, setAuthenticated] = createSignal<boolean>(false);
  const location = useLocation();

  async function performAuthCheck() {
    const sessionOk = await checkSession();
    if (sessionOk) {
      setAuthenticated(true);
    } else {
      window.localStorage.removeItem("authToken");

      try {
        if (
          !window.localStorage.getItem("username") ||
          !window.localStorage.getItem("password")
        ) {
          console.warn("No username or password found in local storage.");

          window.localStorage.removeItem("username");
          window.localStorage.removeItem("password");
          window.location.href = "/login";
          return;
        }

        await startSession();

        setAuthenticated(true);
      } catch (error) {
        console.error("Failed to start session:", error);
        window.localStorage.removeItem("username");
        window.localStorage.removeItem("password");
        window.location.href = "/login";
        return;
      }
    }
  }

  createEffect(on(() => location.pathname, performAuthCheck));

  return <Show when={authenticated()}>{props.children}</Show>;
}

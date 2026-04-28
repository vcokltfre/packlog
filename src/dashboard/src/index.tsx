/* @refresh reload */
import "./index.css";
import { render } from "solid-js/web";
import "solid-devtools";
import { Route, Router } from "@solidjs/router";
import { AuthGuard } from "./guard";
import LoginPage from "./pages/login";
import HomePage from "./pages/home";
import InvitesPage from "./pages/invites";
import SignupPage from "./pages/signup";
import SettingsPage from "./pages/settings";

const root = document.getElementById("root");

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
  throw new Error(
    "Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got misspelled?",
  );
}

render(
  () => (
    <>
      <nav class="p-4 lg:px-[20%] mb-6 flex items-center">
        <a href="/" class="text-2xl font-bold text-white">
          🪂 Packlog
        </a>
        <div class="grow"></div>
        <a href="/settings" class="text-white hover:text-gray-400 mx-2">
          Settings
        </a>
      </nav>
      <main class="px-4 lg:px-[20%]">
        <Router>
          <Route path="/" component={AuthGuard}>
            <Route path="/" component={HomePage} />
            <Route path="/invites" component={InvitesPage} />
            <Route path="/settings" component={SettingsPage} />
          </Route>
          <Route path="/signup" component={SignupPage} />
          <Route path="/login" component={LoginPage} />
        </Router>
      </main>
    </>
  ),
  root!,
);

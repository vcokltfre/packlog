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

const root = document.getElementById("root");

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
  throw new Error(
    "Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got misspelled?",
  );
}

render(
  () => (
    <>
      <nav class="bg-zinc-800 p-4 mb-6 flex items-center">
        <h1 class="text-2xl font-bold text-white">Packlog</h1>
      </nav>
      <main class="px-4 lg:px-[20%]">
        <Router>
          <Route path="/" component={AuthGuard}>
            <Route path="/" component={HomePage} />
            <Route path="/invites" component={InvitesPage} />
            <Route path="/signup" component={SignupPage} />
          </Route>
          <Route path="/login" component={LoginPage} />
        </Router>
      </main>
    </>
  ),
  root!,
);

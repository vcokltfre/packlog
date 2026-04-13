import { useSearchParams } from "@solidjs/router";
import { createSignal } from "solid-js";
import { acceptInvite } from "../api";

const SignupPage = () => {
  const params = useSearchParams<{ code: string }>();
  const code = () => params[0]?.code || "";

  const [password, setPassword] = createSignal("");

  const submit = () => {
    if (!code()) {
      alert("Invite code is missing. Please use a valid invite link.");
      return;
    }

    if (!password()) {
      alert("Please enter a password.");
      return;
    }

    acceptInvite(code(), password())
      .then(() => {
        window.location.href = "/login";
      })
      .catch((err) => {
        console.error("Failed to accept invite:", err);
        alert("Failed to sign up. Please check the invite code and try again.");
      });
  };

  return (
    <div class="flex flex-col items-center justify-center h-[86vh]">
      <div class="bg-zinc-800 p-4 rounded w-full">
        <h1 class="text-2xl font-bold mb-4">Sign Up</h1>
        <div class="mt-4 w-full">
          <h2>Invite Code</h2>
          <input
            type="text"
            class="w-full p-2 rounded bg-zinc-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-zinc-600 disabled:cursor-not-allowed"
            value={code() || ""}
            disabled
          />
        </div>
        <div class="mt-4">
          <h2>Password</h2>
          <input
            type="password"
            class="w-full p-2 rounded bg-zinc-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            onInput={(e) => setPassword(e.currentTarget.value)}
            onKeyDown={(e) => setPassword(e.currentTarget.value)}
          />
        </div>
        <button
          class="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 hover:shadow-lg transition-shadow duration-300"
          onClick={submit}
        >
          Sign Up
        </button>
      </div>
    </div>
  );
};

export default SignupPage;

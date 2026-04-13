import { createSignal } from "solid-js";

const LoginPage = () => {
  const [username, setUsername] = createSignal("");
  const [password, setPassword] = createSignal("");

  const submit = () => {
    localStorage.setItem("username", username());
    localStorage.setItem("password", password());

    window.location.href = "/";
  };

  return (
    <div class="flex flex-col items-center justify-center h-[86vh]">
      <div class="bg-zinc-800 p-4 rounded w-full">
        <h1 class="text-2xl font-bold mb-4">Login</h1>
        <div class="mt-4 w-full">
          <h2>Username</h2>
          <input
            type="text"
            class="w-full p-2 rounded bg-zinc-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            onInput={(e) => setUsername(e.currentTarget.value)}
            onKeyDown={(e) => setUsername(e.currentTarget.value)}
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
          Log In
        </button>
      </div>
    </div>
  );
};

export default LoginPage;

import { Show } from "solid-js";

const SettingsPage = () => {
  const hidePinkTickets = localStorage.getItem("hidePinkTickets") === "true";

  return (
    <>
      <Show when={hidePinkTickets}>
        <button
          class="bg-blue-500 text-white px-4 py-2 rounded"
          onClick={() => {
            localStorage.setItem("hidePinkTickets", "false");
            window.location.reload();
          }}
        >
          Show pink tickets
        </button>
      </Show>
      <Show when={!hidePinkTickets}>
        <button
          class="bg-red-500 text-white px-4 py-2 rounded"
          onClick={() => {
            localStorage.setItem("hidePinkTickets", "true");
            window.location.reload();
          }}
        >
          Hide pink tickets
        </button>
      </Show>
    </>
  );
};

export default SettingsPage;

import { createEffect, createSignal, For, Show } from "solid-js";
import { createInvite, deleteInvite, getInvites } from "../api";
import QRCode from "qrcode";

type InviteProps = {
  code: string;
  username: string;
  refresh: () => void;
};

const Invite = (props: InviteProps) => {
  const copyCodeUrl = () => {
    const url = `${window.location.origin}/signup?code=${props.code}`;
    navigator.clipboard.writeText(url).catch((error) => {
      console.error("Failed to copy invite URL:", error);
    });
  };

  const [qrReady, setQrReady] = createSignal(false);

  const generateQrCode = () => {
    const url = `${window.location.origin}/signup?code=${props.code}`;
    const canvas = document.getElementById(
      "qr-" + props.code,
    ) as HTMLCanvasElement | null;

    if (canvas) {
      QRCode.toCanvas(canvas, url, { width: 200 }, (error) => {
        if (error) {
          console.error("Failed to generate QR code:", error);
          setQrReady(false);
        } else {
          setQrReady(true);
        }
      });
    }
  };

  return (
    <div class="mb-4">
      <div class="bg-zinc-800 p-4 rounded mb-2 flex items-center">
        <div>
          <p class="text-lg font-bold">{props.code}</p>
          <p class="text-sm text-zinc-400">Invite for {props.username}</p>
        </div>
        <div class="grow"></div>
        <button
          class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 mr-2"
          onclick={copyCodeUrl}
        >
          Copy
        </button>
        <button
          class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400"
          onClick={() => {
            deleteInvite(props.code);
            setTimeout(props.refresh, 500);
          }}
        >
          Revoke
        </button>
        <button
          onclick={generateQrCode}
          class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 ml-2"
        >
          Show QR
        </button>
      </div>
      <canvas
        id={"qr-" + props.code}
        classList={{
          hidden: !qrReady(),
        }}
      ></canvas>
    </div>
  );
};

type InviteCreatorProps = {
  refresh: () => void;
};

const InviteCreator = (props: InviteCreatorProps) => {
  const [username, setUsername] = createSignal("");

  return (
    <div>
      <input
        type="text"
        class="w-full p-2 rounded bg-zinc-700 text-white focus:outline-none mb-4"
        placeholder="Enter the username of the person you want to invite..."
        onkeyup={(e) => setUsername(e.currentTarget.value)}
      />
      <button
        class="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-green-400"
        onClick={() => {
          createInvite(username()).then(() => {
            setUsername("");
            setTimeout(props.refresh, 500);
          });
        }}
      >
        Create Invite
      </button>
    </div>
  );
};

const InvitesPage = () => {
  const [invites, setInvites] = createSignal<
    { code: string; username: string }[]
  >([]);

  const refreshInvites = () => {
    getInvites()
      .then(setInvites)
      .catch((error) => {
        console.error("Failed to fetch invites:", error);
        setInvites([]);
      });
  };

  createEffect(() => {
    getInvites()
      .then(setInvites)
      .catch((error) => {
        console.error("Failed to fetch invites:", error);
        setInvites([]);
      });
  });

  return (
    <>
      <h1 class="text-2xl font-bold mb-4">Create Invite</h1>
      <InviteCreator refresh={refreshInvites} />
      <h1 class="text-2xl font-bold mb-4 mt-8">Active Invites</h1>
      <Show when={invites().length === 0}>
        <p class="text-zinc-400">
          No invites found. Create one to get started!
        </p>
      </Show>
      <For each={invites()}>
        {(invite) => (
          <Invite
            code={invite.code}
            username={invite.username}
            refresh={refreshInvites}
          />
        )}
      </For>
    </>
  );
};

export default InvitesPage;

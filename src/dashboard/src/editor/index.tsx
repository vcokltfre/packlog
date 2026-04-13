import { createEffect, createSignal, Show } from "solid-js";
import { getPacklog, Packlog, setPacklog as setPacklogCall } from "../api";

type PacklogCounterProps = {
  name: string;
  value: number;
  onChange: (newValue: number) => void;
  disabled?: boolean;
  display?: boolean;
};

const PacklogCounter = (props: PacklogCounterProps) => {
  const disabled = props.disabled || false;
  const display = props.display || false;

  return (
    <div class="flex items-center space-x-2 mb-2">
      <h2 class="text-2xl">{props.name}</h2>
      <div class="grow"></div>
      <Show when={!display}>
        <button
          class="w-12 h-12 px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 disabled:bg-red-300 disabled:cursor-not-allowed"
          onClick={() => props.onChange(props.value - 1)}
          disabled={disabled || props.value <= 0}
        >
          -
        </button>
      </Show>
      <input
        type="text"
        class="w-16 h-12 text-center bg-zinc-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:bg-zinc-600 disabled:cursor-not-allowed"
        value={props.value}
        onInput={(e) => {
          props.onChange(parseInt(e.currentTarget.value) || 0);
        }}
        disabled={disabled}
      />
      <Show when={!display}>
        <button
          class="w-12 h-12 px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 disabled:bg-green-300 disabled:cursor-not-allowed"
          onClick={() => props.onChange(props.value + 1)}
          disabled={disabled}
        >
          +
        </button>
      </Show>
    </div>
  );
};

export const PacklogCounters = (props: {
  packlog: Packlog;
  onChange: (newPacklog: Packlog) => void;
  disabled?: boolean;
  display?: boolean;
}) => {
  return (
    <div>
      <PacklogCounter
        name="Tandems"
        value={props.packlog.tandems}
        onChange={(newValue) =>
          props.onChange({ ...props.packlog, tandems: newValue })
        }
        disabled={props.disabled}
        display={props.display}
      />
      <PacklogCounter
        name="Kit Hire"
        value={props.packlog.kit_hire}
        onChange={(newValue) =>
          props.onChange({ ...props.packlog, kit_hire: newValue })
        }
        disabled={props.disabled}
        display={props.display}
      />
      <PacklogCounter
        name="Blue Tickets"
        value={props.packlog.blue_ticket}
        onChange={(newValue) =>
          props.onChange({ ...props.packlog, blue_ticket: newValue })
        }
        disabled={props.disabled}
        display={props.display}
      />
      <PacklogCounter
        name="Instructor"
        value={props.packlog.instructor}
        onChange={(newValue) =>
          props.onChange({ ...props.packlog, instructor: newValue })
        }
        disabled={props.disabled}
        display={props.display}
      />
      <PacklogCounter
        name="Pink Tickets"
        value={props.packlog.pink_ticket}
        onChange={(newValue) =>
          props.onChange({ ...props.packlog, pink_ticket: newValue })
        }
        disabled={props.disabled}
        display={props.display}
      />
    </div>
  );
};

export const PacklogStats = (props: { packlog: Packlog }) => {
  const total = () =>
    (
      props.packlog.tandems * 11 +
      props.packlog.instructor * 6.5 +
      props.packlog.blue_ticket * 6.5 +
      props.packlog.kit_hire * 6.5
    ).toFixed(2);

  return (
    <>
      <div class="mt-4 flex items-center text-zinc-400">
        <p>Total Packs</p>
        <div class="grow"></div>
        <p>
          {props.packlog.tandems +
            props.packlog.instructor +
            props.packlog.blue_ticket +
            props.packlog.pink_ticket +
            props.packlog.kit_hire}
        </p>
      </div>
      <div class="mt-4 flex items-center text-zinc-400">
        <p>Total Earnings</p>
        <div class="grow"></div>
        <p>£{total()}</p>
      </div>
    </>
  );
};

type EditorProps = {
  date?: string;
};

const Editor = (props: EditorProps) => {
  const [packlog, setPacklog] = createSignal<Packlog>({
    date: props.date || new Date().toISOString().split("T")[0],
    tandems: 0,
    instructor: 0,
    blue_ticket: 0,
    pink_ticket: 0,
    kit_hire: 0,
  });
  const [total, setTotal] = createSignal<string>("0.00");

  createEffect(() => {
    const date = props.date || new Date().toISOString().split("T")[0];
    console.log("Fetching packlog for date:", date);

    getPacklog(date)
      .then((data) => {
        setPacklog(data);
        setTotal(
          (
            packlog().tandems * 11 +
            packlog().instructor * 6.5 +
            packlog().blue_ticket * 6.5 +
            packlog().kit_hire * 6.5
          ).toFixed(2),
        );
      })
      .catch((error) => {
        console.error("Failed to fetch today's packlog:", error);
        setPacklog({
          date,
          tandems: 0,
          instructor: 0,
          blue_ticket: 0,
          pink_ticket: 0,
          kit_hire: 0,
        });
      });
  });

  const updatePacklog = (packlog: Packlog) => {
    setPacklog(packlog);
    setPacklogCall(packlog.date, packlog).catch((error) => {
      console.error("Failed to save packlog:", error);
    });

    setTotal(
      (
        packlog.tandems * 11 +
        packlog.instructor * 6.5 +
        packlog.blue_ticket * 6.5 +
        packlog.kit_hire * 6.5
      ).toFixed(2),
    );
  };

  return (
    <div>
      <PacklogCounters onChange={updatePacklog} packlog={packlog()} />
      <PacklogStats packlog={packlog()} />
    </div>
  );
};

export default Editor;

import { createEffect, createSignal } from "solid-js";
import {
  getPacklog,
  getPacklogsBetween,
  getPacklogsBetweenCSV,
  getSelf,
  Packlog,
} from "../api";
import Editor, { PacklogCounters, PacklogStats } from "../editor";

const PackEditor = () => {
  const [date, setDate] = createSignal<string>(
    new Date().toISOString().split("T")[0],
  );

  const [inputOk, setInputOk] = createSignal<boolean>(true);

  return (
    <div class="mt-8 panel-bg p-4 rounded">
      <h2 class="text-2xl font-bold mb-4">Pack Editor</h2>
      <p class="mb-2 text-zinc-400 text-sm">
        Dates must be in the YYYY-MM-DD format.
      </p>
      <input
        type="text"
        class="w-full p-2 rounded bg-zinc-700 text-white focus:outline-none mb-4"
        classList={{
          "border-2 border-red-500": !inputOk(),
        }}
        onkeyup={(e) => {
          const value = e.currentTarget.value;
          if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
            setInputOk(true);
            setDate(value);
          } else {
            setInputOk(false);
          }
        }}
        placeholder="Enter a date formatted YYYY-MM-DD..."
        value={date()}
      />
      <Editor date={date()}></Editor>
    </div>
  );
};

const condensePacklogs = (packlogs: Packlog[]): Packlog => {
  return {
    date: "",
    tandems: packlogs.reduce((sum, log) => sum + log.tandems, 0),
    instructor: packlogs.reduce((sum, log) => sum + log.instructor, 0),
    blue_ticket: packlogs.reduce((sum, log) => sum + log.blue_ticket, 0),
    pink_ticket: packlogs.reduce((sum, log) => sum + log.pink_ticket, 0),
    kit_hire: packlogs.reduce((sum, log) => sum + log.kit_hire, 0),
  };
};

const PacklogsCounter = (props: { packlogs: Packlog[] }) => {
  return (
    <PacklogCounters
      display={true}
      onChange={() => {}}
      packlog={condensePacklogs(props.packlogs)}
    />
  );
};

const PackRangeViewer = () => {
  const [startDate, setStartDate] = createSignal<string>(
    new Date().toISOString().split("T")[0],
  );
  const [endDate, setEndDate] = createSignal<string>(
    new Date().toISOString().split("T")[0],
  );

  if (localStorage.getItem("startDate")) {
    setStartDate(localStorage.getItem("startDate")!);
  }
  if (localStorage.getItem("endDate")) {
    setEndDate(localStorage.getItem("endDate")!);
  }

  const [startInputOk, setStartInputOk] = createSignal<boolean>(true);
  const [endInputOk, setEndInputOk] = createSignal<boolean>(true);

  const [packlogs, setPacklogs] = createSignal<Packlog[]>([]);

  createEffect(() => {
    if (startInputOk() && endInputOk()) {
      getPacklogsBetween(startDate(), endDate())
        .then((data) => setPacklogs(data))
        .catch((error) => {
          console.error("Failed to fetch packlogs:", error);
          setPacklogs([]);
        });
    }
  });

  const refreshPacklogs = () => {
    if (startInputOk() && endInputOk()) {
      getPacklogsBetween(startDate(), endDate())
        .then((data) => setPacklogs(data))
        .catch((error) => {
          console.error("Failed to fetch packlogs:", error);
          setPacklogs([]);
        });
    }
  };

  return (
    <div class="mt-8 panel-bg p-4 rounded">
      <h2 class="text-2xl font-bold mb-4">Pack Range Viewer</h2>
      <p class="mb-2 text-zinc-400 text-sm">
        Dates must be in the YYYY-MM-DD format.
      </p>
      <input
        type="text"
        class="w-full p-2 rounded bg-zinc-700 text-white focus:outline-none mb-4"
        classList={{
          "border-2 border-red-500": !startInputOk(),
        }}
        onkeyup={(e) => {
          const value = e.currentTarget.value;
          if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
            setStartInputOk(true);
            setStartDate(value);
            localStorage.setItem("startDate", value);
            refreshPacklogs();
          } else {
            setStartInputOk(false);
          }
        }}
        placeholder="Enter a start date formatted YYYY-MM-DD..."
        value={startDate()}
      />
      <input
        type="text"
        class="w-full p-2 rounded bg-zinc-700 text-white focus:outline-none mb-4"
        classList={{
          "border-2 border-red-500": !endInputOk(),
        }}
        onkeyup={(e) => {
          const value = e.currentTarget.value;
          if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
            setEndInputOk(true);
            setEndDate(value);
            localStorage.setItem("endDate", value);
            refreshPacklogs();
          } else {
            setEndInputOk(false);
          }
        }}
        placeholder="Enter an end date formatted YYYY-MM-DD..."
        value={endDate()}
      />
      <PacklogsCounter packlogs={packlogs()} />
      <PacklogStats packlog={condensePacklogs(packlogs())} />
      <button
        class="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
        onClick={() => {
          getPacklogsBetweenCSV(startDate(), endDate())
            .then((csvData) => {
              const blob = new Blob([csvData], { type: "text/csv" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `packlogs_${startDate()}_to_${endDate()}.csv`;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              URL.revokeObjectURL(url);
            })
            .catch((error) => {
              console.error("Failed to fetch CSV data:", error);
            });
        }}
      >
        Export CSV
      </button>
    </div>
  );
};

const HomePage = () => {
  const [username, setUsername] = createSignal<string | null>(null);

  createEffect(() => {
    getSelf()
      .then((data) => setUsername(data.username))
      .catch((error) => {
        console.error("Failed to fetch user info:", error);
        setUsername(null);
      });
  });

  return (
    <>
      <h2 class="text-3xl font-bold">
        Hello, {username() ? username() : "loading..."}!
      </h2>
      <PackEditor />
      <PackRangeViewer />
      <br></br>
    </>
  );
};

export default HomePage;

import { getAppInfo, greet } from "@neobank-stellar/shared";

export function App() {
  const info = getAppInfo("0.0.0");

  return (
    <main className="app">
      <h1>{info.name}</h1>
      <p>{greet("world")}</p>
      <p className="version">v{info.version}</p>
    </main>
  );
}

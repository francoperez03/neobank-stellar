import { getAppInfo, greet } from "@neobank-stellar/shared";
import { Button } from "@/components/ui/button";

export function App() {
  const info = getAppInfo("0.0.0");

  return (
    <main className="app">
      <h1>{info.name}</h1>
      <p>{greet("world")}</p>
      <p className="version">v{info.version}</p>
      <Button onClick={() => console.log("pipip")}>shadcn test button</Button>
    </main>
  );
}

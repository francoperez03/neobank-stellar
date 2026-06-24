import { createServer } from "node:http";
import { getAppInfo, greet } from "@neobank-stellar/shared";

const PORT = Number(process.env.PORT ?? 3000);

const server = createServer((req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.end(
    JSON.stringify({
      ...getAppInfo("0.0.0"),
      message: greet("mundo"),
      path: req.url,
    })
  );
});

server.listen(PORT, () => {
  console.log(`Neobank Stellar web escuchando en http://localhost:${PORT}`);
});

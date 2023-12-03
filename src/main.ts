import express from "express";
import {
  selectDomain,
  updateDomainsTraffic,
} from "./jobs/updateDomainsTraffic.js";
import { env } from "./env.js";

const app = express();
app.use(express.json());
app.get("/", (_, res) => {
  res.send("Hello, this is a balancer");
});

setInterval(async () => {
  await updateDomainsTraffic();
  await selectDomain();
}, Number(env.INTERVAL) * 1000);

app.listen(env.PORT, () =>
  console.log(`🚀 Server ready at: http://localhost:${env.PORT}`)
);

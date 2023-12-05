import { env } from "../env.js";
import { selectDomain, updateDomainsTraffic } from "./updateDomainsTraffic.js";

export function runJobs() {
  setInterval(async () => {
    await updateDomainsTraffic();
    await selectDomain();
  }, Number(env.JOBS_INTERVAL) * 1000);
}

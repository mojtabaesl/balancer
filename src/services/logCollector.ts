import { env } from "../env.js";

class Axiom {
  constructor(
    private apiUrl: string,
    private datasetName: string,
    private apiToken: string
  ) {
    this.apiUrl = apiUrl + "/" + datasetName + "/ingest";
    this.apiToken = apiToken;
    this.datasetName = datasetName;
  }

  private async handleFetch(options?: RequestInit) {
    try {
      const res = await fetch(this.apiUrl, {
        ...options,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiToken}}`,
        },
      });
      console.log(`Authorization: Bearer ${this.apiToken}`);
      const reso = await res.json();
      console.log({ reso });
      console.log({ url: this.apiUrl });
    } catch (error) {
      console.log(error);
    }
  }

  async sendLog(data: Record<string, unknown>) {
    await this.handleFetch({
      body: JSON.stringify([
        {
          _time: Date.now(),
          data,
        },
      ]),
    });
  }
}

const logCollector = new Axiom(
  env.AXIOM_API_URL,
  env.AXIOM_DATASET_NAME,
  env.AXIOM_API_TOKEN
);

export { logCollector };

import { components, paths } from "../../@types/generated.js";
import { env } from "../env.js";
import { logCollector } from "./logCollector.js";

interface DomainReportsQuery {
  period: "1h" | "3h" | "6h" | "12h" | "24h" | "7d" | "30d";
  since: string;
  until: string;
}

interface DomainGetReportsParams {
  domain: string;
  params: Partial<DomainReportsQuery>;
  options?: RequestInit;
}

interface GetDnsRecordsProps {
  domain: string;
}

type UpdateDnsRecordBody = components["schemas"]["DnsRecord"];

interface UpdateDnsRecordProps {
  domain: string;
  dnsRecordId: string;
  body: UpdateDnsRecordBody;
}

type DomainGetReportsResult =
  paths["/domains/{domain}/reports/traffics"]["get"]["responses"]["200"]["content"]["application/json"];

type GetDnsRecordsResults =
  paths["/domains/{domain}/dns-records"]["get"]["responses"]["200"]["content"]["application/json"];

export class DomainService {
  constructor(private apiUrl: string, private apiToken: string) {
    this.apiUrl = apiUrl + "/domains";
    this.apiToken = apiToken;
  }

  private async handleFetch(url: string, options?: RequestInit) {
    console.log("Network", { url });
    try {
      const res = await fetch(url, {
        ...options,
        headers: {
          Authorization: this.apiToken,
          ...options?.headers,
        },
      });
      return await res.json();
    } catch (error) {
      console.log(error);
    }
  }

  async getReports({
    domain,
    params,
    options,
  }: DomainGetReportsParams): Promise<DomainGetReportsResult> {
    const url =
      this.apiUrl +
      `/${domain}/reports/traffics?` +
      new URLSearchParams(params);
    return await this.handleFetch(url, { ...options });
  }

  async getDnsRecords({
    domain,
  }: GetDnsRecordsProps): Promise<GetDnsRecordsResults> {
    const url = this.apiUrl + `/${domain}/dns-records`;
    return await this.handleFetch(url);
  }

  async updateDnsRecord({
    domain,
    dnsRecordId,
    body,
  }: UpdateDnsRecordProps): Promise<GetDnsRecordsResults> {
    const url = this.apiUrl + `/${domain}/dns-records/${dnsRecordId}`;
    return await this.handleFetch(url, {
      body: JSON.stringify(body),
      method: "PUT",
      headers: {
        "content-type": "application/json",
      },
    });
  }
}

const domainService = new DomainService(env.ARVAN_URL, env.ARVAN_API_TOKEN);

export { domainService };

import { components, paths } from "../../@types/generated.js";
import { env } from "../env.js";

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
  options?: RequestInit;
}

type UpdateDnsRecordBody = components["schemas"]["DnsRecord"];

interface UpdateDnsRecordProps {
  domain: string;
  dnsRecordId: string;
  data: UpdateDnsRecordBody;
  options?: RequestInit;
}

type DomainGetReportsResult =
  paths["/domains/{domain}/reports/traffics"]["get"]["responses"]["200"]["content"]["application/json"];

type GetDnsRecordsResults =
  paths["/domains/{domain}/dns-records"]["get"]["responses"]["200"]["content"]["application/json"];

export class DomainService {
  constructor(private apiUrl: string) {
    this.apiUrl = apiUrl + "/domains";
  }

  private async handleFetch(url: string, options?: RequestInit) {
    console.log("Network", { url });
    try {
      const res = await fetch(url, options);
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
    return await this.handleFetch(url, options);
  }

  async getDnsRecords({
    domain,
    options,
  }: GetDnsRecordsProps): Promise<GetDnsRecordsResults> {
    const url = this.apiUrl + `/${domain}/dns-records`;
    return await this.handleFetch(url, options);
  }

  async updateDnsRecord({
    domain,
    dnsRecordId,
    data,
    options,
  }: UpdateDnsRecordProps): Promise<GetDnsRecordsResults> {
    const url = this.apiUrl + `/${domain}/dns-records/${dnsRecordId}`;
    const { headers, ...rest } = options ?? {};
    return await this.handleFetch(url, {
      ...rest,
      body: JSON.stringify(data),
      method: "PUT",
      headers: {
        "content-type": "application/json",
        ...headers,
      },
    });
  }
}

const domainService = new DomainService(env.ARVAN_URL);

export { domainService };

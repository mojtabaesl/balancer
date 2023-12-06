import { prisma } from "../prisma.js";
import { domainService } from "../services/service.js";
import { convertByteToGB, decrypt } from "../utils.js";

export const updateDomainsTraffic = async () => {
  try {
    const domains = await prisma.middleDomain.findMany({
      include: { Cdn: { select: { apiToken: true } } },
    });

    await domains.forEach(async (domain) => {
      if (!domain?.Cdn?.apiToken) return;

      const trafficReports = await domainService.getReports({
        domain: domain.name,
        params: { period: "7d" },
        options: {
          headers: { Authorization: decrypt(domain?.Cdn?.apiToken) },
        },
      });

      const { series } = trafficReports.data?.charts?.traffics ?? {};
      const dailyTraffics = series?.find(
        (series) => series.name === "reports.traffics.total"
      );
      const todayTraffic = dailyTraffics?.data?.pop() ?? 0;
      const todayTrafficGB = convertByteToGB(todayTraffic);

      await prisma.middleDomain.update({
        data: {
          traffic: todayTrafficGB,
          isActive: todayTrafficGB < domain.trafficLimit,
        },
        where: { name: domain.name },
      });
    });
  } catch (error) {
    console.log(error);
  }
};

export const selectDomain = async () => {
  const limitedRootDomains = await prisma.rootDomain.findMany({
    where: { value: { isActive: false } },
    include: {
      value: true,
      Balancer: {
        select: {
          id: true,
          middleDomainDNSRecordName: true,
        },
      },
      Cdn: {
        select: { apiToken: true },
      },
    },
  });

  const emptyRootDomains = await prisma.rootDomain.findMany({
    where: { value: null },
    include: {
      value: true,
      Balancer: {
        select: {
          id: true,
          middleDomainDNSRecordName: true,
        },
      },
      Cdn: {
        select: { apiToken: true },
      },
    },
  });

  [...limitedRootDomains, ...emptyRootDomains].forEach(
    async (limitedRootDomain) => {
      try {
        const selectableMiddleDomain = await prisma.middleDomain.findFirst({
          where: {
            AND: {
              isActive: true,
              RootDomain: null,
              balancerId: limitedRootDomain.Balancer?.id,
            },
          },
          include: {
            Balancer: { select: { middleDomainDNSRecordName: true } },
          },
        });

        // do nothing if there were no selectable middle domain
        if (!selectableMiddleDomain) return;
        if (!limitedRootDomain.Cdn?.apiToken) return;

        // update dns record
        const dnsRecords = await domainService.getDnsRecords({
          domain: limitedRootDomain.name,
          options: {
            headers: {
              Authorization: decrypt(limitedRootDomain.Cdn?.apiToken),
            },
          },
        });

        const rootDomainDNSRecord = dnsRecords.data?.find(
          (record) =>
            record.type === "cname" &&
            record.name === limitedRootDomain.subDomain
        );

        const host =
          selectableMiddleDomain.Balancer?.middleDomainDNSRecordName +
          "." +
          selectableMiddleDomain.name;

        await domainService.updateDnsRecord({
          domain: limitedRootDomain?.name,
          dnsRecordId: rootDomainDNSRecord?.id as string,
          data: {
            type: "cname",
            name: rootDomainDNSRecord?.name,
            value: { host_header: "source", host },
          },
          options: {
            headers: {
              Authorization: decrypt(limitedRootDomain.Cdn?.apiToken),
            },
          },
        });

        await prisma.rootDomain.update({
          where: { id: limitedRootDomain.id },
          data: { value: { connect: { id: selectableMiddleDomain?.id } } },
        });
      } catch (err) {
        console.error(err);
      }
    }
  );
};

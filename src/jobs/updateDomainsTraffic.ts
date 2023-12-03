import { prisma } from "../prisma.js";
import { domainService } from "../services/service.js";
import { convertByteToGB } from "../utils.js";

export const updateDomainsTraffic = async () => {
  try {
    const domains = await prisma.middleDomain.findMany({
      include: { Cdn: { select: { apiToken: true } } },
    });

    await domains.forEach(async (domain) => {
      const trafficReports = await domainService.getReports({
        domain: domain.name,
        params: { period: "7d" },
        options: { headers: { Authorization: domain?.Cdn?.apiToken ?? "" } },
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
  try {
    const limitedRootDomains = await prisma.rootDomain.findMany({
      where: { value: { isActive: false } },
      include: {
        value: true,
        Balancer: {
          select: {
            middleDomainDNSRecordName: true,
          },
        },
      },
    });

    limitedRootDomains.forEach(async (limitedRootDomain) => {
      const selectableMiddleDomain = await prisma.middleDomain.findFirst({
        where: { AND: { isActive: true, isSelected: false } },
        include: { Balancer: { select: { middleDomainDNSRecordName: true } } },
      });

      // do nothing if there were no selectable middle domain
      if (!selectableMiddleDomain) return;

      // update dns record
      const dnsRecords = await domainService.getDnsRecords({
        domain: limitedRootDomain.name,
      });

      const rootDomainDNSRecord = dnsRecords.data?.find(
        (record) =>
          record.type === "cname" && record.name === limitedRootDomain.subDomain
      );

      console.log({ rootDomainDNSRecord });

      const host =
        selectableMiddleDomain.Balancer?.middleDomainDNSRecordName +
        "." +
        selectableMiddleDomain.name;

      await domainService.updateDnsRecord({
        domain: limitedRootDomain?.name,
        dnsRecordId: rootDomainDNSRecord?.id as string,
        body: {
          type: "cname",
          name: rootDomainDNSRecord?.name,
          value: { host_header: "source", host },
        },
      });

      // set new middle domain as selected
      await prisma.middleDomain.update({
        where: { id: selectableMiddleDomain?.id },
        data: { isSelected: true },
      });

      // set previous middle domain as unselected
      await prisma.middleDomain.update({
        where: { id: limitedRootDomain.value?.id },
        data: { isSelected: false },
      });

      await prisma.rootDomain.update({
        where: { id: limitedRootDomain.id },
        data: { value: { connect: { id: selectableMiddleDomain?.id } } },
      });
    });
  } catch (error) {
    console.log(error);
  }
};
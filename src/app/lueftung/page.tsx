import { ServicePage, serviceMetadata } from "@/components/ServicePage";

export const metadata = serviceMetadata("lueftung");

export default function Page() {
  return <ServicePage slug="lueftung" />;
}

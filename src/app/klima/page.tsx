import { ServicePage, serviceMetadata } from "@/components/ServicePage";

export const metadata = serviceMetadata("klima");

export default function Page() {
  return <ServicePage slug="klima" />;
}

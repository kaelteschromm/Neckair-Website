import { ServicePage, serviceMetadata } from "@/components/ServicePage";

export const metadata = serviceMetadata("heizung");

export default function Page() {
  return <ServicePage slug="heizung" />;
}

import { ServicePage, serviceMetadata } from "@/components/ServicePage";

export const metadata = serviceMetadata("sanitaer");

export default function Page() {
  return <ServicePage slug="sanitaer" />;
}

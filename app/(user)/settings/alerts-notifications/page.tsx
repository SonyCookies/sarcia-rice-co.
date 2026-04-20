import type { Metadata } from "next";

import AlertsNotificationsContent from "@/app/(user)/settings/alerts-notifications/_components/alerts-notifications-content";

export const metadata: Metadata = {
  title: "Alerts & Notifications | Sarcia Rice Co.",
  description:
    "Review how Sarcia Rice Co. uses alerts and notifications for orders, deliveries, and account activity.",
};

export default function AlertsNotificationsPage() {
  return <AlertsNotificationsContent />;
}

import type { Metadata } from "next";

import AdminAlertsNotificationsContent from "@/app/admin/settings/alerts-notifications/_components/alerts-notifications-content";

export const metadata: Metadata = {
  title: "Admin Alerts & Notifications | Sarcia Rice Co.",
  description:
    "Review how Sarcia Rice Co. uses admin reminders, security alerts, and browser push notifications.",
};

export default function AdminAlertsNotificationsPage() {
  return <AdminAlertsNotificationsContent />;
}

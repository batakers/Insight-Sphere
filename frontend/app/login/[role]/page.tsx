"use client";

import { useParams, notFound } from "next/navigation";
import { PortalTemplate } from "@/app/components/PortalTemplate";
import { UserRole } from "@/app/context/AuthContext";
import { useTranslation } from "@/app/i18n";

const VALID_ROLES = ["owner", "inventory_manager", "cashier", "admin"];

export default function LoginPage() {
  const params = useParams();
  const { t } = useTranslation();
  const role = params.role as string;

  if (!VALID_ROLES.includes(role)) {
    return notFound();
  }

  const title = t(`auth.login.${role}.title`);
  const subtitle = t(`auth.login.${role}.subtitle`);

  return <PortalTemplate portalType={role as UserRole} title={title} subtitle={subtitle} />;
}

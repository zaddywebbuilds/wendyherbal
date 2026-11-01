import { Suspense } from "react";
import type { Metadata } from "next";
import { PasswordForm } from "@/components/admin/PasswordForm";

export const metadata: Metadata = {
  title: "Change password",
  robots: { index: false, follow: false },
};

export default function AdminPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#123D2B]" />}>
      <PasswordForm />
    </Suspense>
  );
}

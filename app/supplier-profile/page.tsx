import type { Metadata } from "next";
import { Suspense } from "react";
import { MobileProfileFlow } from "@/components/mobile-profile";

export const metadata: Metadata = {
  title: "Supplier Profile — Thomas For Industry",
};

/**
 * Mobile SRP → company profile (THO-3195). No `id` shows the results; `?id=`
 * shows that supplier's profile in the same tab.
 */
export default function SupplierProfileRoute() {
  return (
    <Suspense fallback={null}>
      <MobileProfileFlow />
    </Suspense>
  );
}

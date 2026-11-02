import type { Metadata } from "next";
import { Suspense } from "react";
import { MobileCategoryFlow } from "@/components/mobile-category";

export const metadata: Metadata = {
  title: "Stamping Services Suppliers — Thomas For Industry",
};

/**
 * Mobile category page (MLLP), THO-3196. `?v=current` shows today's layout;
 * no `v` shows the proposed one.
 */
export default function CategoryMobileRoute() {
  return (
    <Suspense fallback={null}>
      <MobileCategoryFlow />
    </Suspense>
  );
}

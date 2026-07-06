import type { Viewport } from "next";

import { PWA_THEME_COLOR } from "@/lib/pwa/config";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: PWA_THEME_COLOR,
  colorScheme: "dark",
};

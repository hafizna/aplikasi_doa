import type { CapacitorConfig } from "@capacitor/cli";

/**
 * Konfigurasi Capacitor untuk build native iOS/Android.
 *
 * `webDir` menunjuk ke hasil `next build` dengan `output: "export"` (folder `out`).
 * Aktifkan export hanya untuk build native (mis. via env CAP_BUILD=1 di next.config),
 * agar build web/PWA + service worker tetap normal. Lihat docs/native-capacitor-design.md.
 */
const config: CapacitorConfig = {
  appId: "com.munajat.app",
  appName: "Munajat",
  webDir: "out",
  plugins: {
    LocalNotifications: {
      smallIcon: "ic_stat_icon",
      iconColor: "#17443f"
    }
  }
};

export default config;

import createNextIntlPlugin from "next-intl/plugin";

/*
|--------------------------------------------------------------------------
| next-intl plugin
|--------------------------------------------------------------------------
|
| Wires the i18n request configuration (./i18n/request.ts) into Next.js.
| This must wrap the Next config so that every request resolves
| its locale and loads the correct messages.
|
*/
const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  async rewrites() {
    const backendUrl =
      process.env.BACKEND_URL || "http://backend:5000";

    return [
      {
        source: "/api/:path*",
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  additionalPrecacheEntries: [
    { url: "/~offline", revision: "phase-1" }
  ],
  disable: process.env.NODE_ENV === "development",
  swSrc: "app/sw.ts",
  swDest: "public/sw.js"
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true
};

export default withSerwist(nextConfig);

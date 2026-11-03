/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  async rewrites() {
    return {
      beforeFiles: [
        { source: "/index.html", destination: "/" },
        { source: "/converters.html", destination: "/converters" },
        { source: "/converter.html", destination: "/converter" },
        { source: "/:slug.html", destination: "/:slug" },
      ],
    };
  },
};

export default nextConfig;

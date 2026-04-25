import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Redirects for routes that have been consolidated or removed.
  // Permanent (308) so search engines update their index — these mappings are stable.
  async redirects() {
    return [
      {
        // /careers was a stub with no current hiring need; consolidate inbound
        // traffic to /contact where applicants can still reach us.
        source: "/careers",
        destination: "/contact",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;

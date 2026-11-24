import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: '/coordenador/aprendizes',
        destination: '/coordenador/dossies',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;

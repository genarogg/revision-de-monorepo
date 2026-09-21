/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
   async rewrites() {
      return [
        {
          source: '/api/:path*',
          destination: 'http://localhost:4000/:path*', // Proxy a backend RESTQ
        },
        {
          source: '/graphql/:path*',
          destination: 'http://localhost:4000/graphql', // Proxy a GraphQL
        },
        {
          source: '/docs/:path*',
          destination: 'http://localhost:4500/:path*', // Otro servidor
        },
      ];
    },
}

export default nextConfig

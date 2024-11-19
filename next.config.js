// /** @type {import('next').NextConfig} */

// const nextConfig = {
//   swcMinify: true,
//   basePath: process.env.NEXT_PUBLIC_BASE_PATH,
//   assetPrefix: process.env.NEXT_PUBLIC_BASE_PATH,
//   images: {
//     domains: [
//       'images.unsplash.com',
//       'i.ibb.co',
//       'scontent.fotp8-1.fna.fbcdn.net',
//     ],
//     unoptimized: true,
//   },

//   // experimental: {
//   //   appDir: true,
//   // },
//   async rewrites() {
//     return [
//       {
//         source: '/src/api/:path*',
//         destination: '/src/api/:path*',
//       },
//     ];
//   },
// };

// module.exports = nextConfig;
/** @type {import('next').NextConfig} */
const nextConfig = {
  swcMinify: true,
  basePath: process.env.NEXT_PUBLIC_BASE_PATH,
  assetPrefix: process.env.NEXT_PUBLIC_BASE_PATH,
  images: {
    domains: [
      'images.unsplash.com',
      'i.ibb.co',
      'scontent.fotp8-1.fna.fbcdn.net',
    ],
    unoptimized: true,
  },

  async rewrites() {
    return [
      {
        source: '/src/api/:path*',
        destination: '/src/api/:path*',
      },
    ];
  },

  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Chỉ thêm phần fallback cho môi trường client-side
      config.resolve.fallback = {
        fs: false, // Loại bỏ mô-đun fs ở phía client
        os: false, // Loại bỏ mô-đun os nếu không cần
      };
    }
    return config;
  },
};

module.exports = nextConfig;

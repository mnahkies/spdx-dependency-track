/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  webpack: (
    config,
    {buildId, dev, isServer, defaultLoaders, nextRuntime, webpack}
  ) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      // TODO: HACK: the alpha typescript-nextjs template is using the
      //       koa runtime which doesn't play nicely with nextjs
      koa: false,
      '@koa/cors': false,
      'koa-body': false,
    }
    // Important: return the modified config
    return config
  },
};

export default nextConfig;

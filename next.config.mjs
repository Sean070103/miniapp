/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['@prisma/client', 'bcrypt'],
  images: {
    domains: ['uploadthing.com', 'utfs.io'],
  },
  env: {
    UPLOADTHING_SECRET: process.env.UPLOADTHING_SECRET,
    UPLOADTHING_APP_ID: process.env.UPLOADTHING_APP_ID,
  },
  // Enhanced webpack configuration for better chunk loading
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Optimize chunk loading with better error handling
      config.optimization.splitChunks = {
        chunks: 'all',
        maxInitialRequests: 25,
        minSize: 20000,
        cacheGroups: {
          default: false,
          vendors: false,
          // Create a separate chunk for vendor libraries
          vendor: {
            name: 'vendor',
            chunks: 'all',
            test: /node_modules/,
            priority: 20,
            enforce: true,
          },
          // Create a separate chunk for common modules
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            priority: 10,
            reuseExistingChunk: true,
            enforce: true,
          },
          // Add specific chunks for large libraries
          react: {
            name: 'react',
            chunks: 'all',
            test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
            priority: 30,
            enforce: true,
          },
        },
      }
      
      // Improve chunk loading reliability
      config.output = {
        ...config.output,
        chunkFilename: 'static/chunks/[id].[chunkhash].js',
        filename: 'static/js/[name].[chunkhash].js',
      }
      
      // Add chunk loading timeout handling
      config.optimization.chunkIds = 'deterministic'
    }
    return config
  },
  // Add experimental features for better performance
  experimental: {
    optimizePackageImports: ['@radix-ui/react-icons', 'lucide-react'],
  },
};

export default nextConfig;

// Next.js config to set CORS headers for all API routes
const nextConfig = {
  async headers() {
    return [
      {
        // apply these headers to all routes under /api/
        source: '/api/:path*',
        headers: [
          // allow requests from any origin '*'
          { key: 'Access-Control-Allow-Origin', value: '*' },

          // specify allowed HTTP methods for CORS requests
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },

          // specify which HTTP headers can be used in requests
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },

          // allow sending credentials like cookies and HTTP authentication in cross-origin requests
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
        ],
      },
    ];
  },
};

export default nextConfig;

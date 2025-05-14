/** @type {import("next").NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	// Add other Next.js configurations here if needed
	// Example: Image optimization domains
	// images: {
	//   domains: ["example.com"],
	// },
  };
  
  import withPWAInit from "@ducanh2912/next-pwa";
  
  const withPWA = withPWAInit({
	dest: "public",
	disable: process.env.NODE_ENV === "development", // Disable PWA in development for easier debugging
	register: true, // Register the service worker
	skipWaiting: true, // Install new service worker immediately
	// scope: ".", // Default scope is fine
	// sw: "service-worker.js", // Default name is fine
	cacheOnFrontEndNav: true, // Cache pages navigated to client-side
	aggressiveFrontEndNavCaching: true, // More aggressive caching for client-side navigation
	reloadOnOnline: true, // Reload the app when it comes back online
	fallbacks: {
	  // Optional: Custom fallback pages for offline
	  // document: "/_offline", // A page route for offline fallback
	  // image: "/static/images/fallback.png",
	  // font: "/static/fonts/fallback.woff2",
	},
	workboxOptions: {
	  // Additional Workbox options if needed
	  // Example: Runtime caching for API routes
	  runtimeCaching: [
		{
		  urlPattern: /^\/api\/.*/i, // Cache API calls
		  handler: "NetworkFirst", // Or CacheFirst, StaleWhileRevalidate
		  options: {
			cacheName: "api-cache",
			expiration: {
			  maxEntries: 32,
			  maxAgeSeconds: 60 * 60 * 24, // 1 day
			},
			networkTimeoutSeconds: 10, // Timeout for network request
		  },
		},
		{
		  urlPattern: /.*/i, // Default cache for other requests
		  handler: "NetworkFirst",
		  options: {
			cacheName: "others-cache",
			expiration: {
			  maxEntries: 32,
			  maxAgeSeconds: 60 * 60 * 24, // 1 day
			},
			networkTimeoutSeconds: 10,
		  },
		},
	  ],
	},
  });
  
  export default withPWA(nextConfig);
  
  
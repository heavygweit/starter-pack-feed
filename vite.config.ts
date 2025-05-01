import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [react()],
	server: {
		cors: true,
		watch: {
			usePolling: false,
		},
		strictPort: true, // Don't try another port if 5173 is in use
		allowedHosts: [
			"localhost"
		],
		proxy: {
			"/api": {
				target: "https://api.warpcast.com",
				changeOrigin: true,
				rewrite: (path) => path.replace(/^\/api/, ""),
				configure: (proxy, _options) => {
					proxy.on("error", (err, _req, _res) => {
						console.log("proxy error", err);
					});
					proxy.on("proxyReq", (proxyReq, req, _res) => {
						console.log("Sending Request to the Target:", req.method, req.url);
					});
					proxy.on("proxyRes", (proxyRes, req, _res) => {
						console.log(
							"Received Response from the Target:",
							proxyRes.statusCode,
							req.url,
						);
					});
				},
			},
		},
	},
});

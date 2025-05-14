import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import MainLayout from "../components/layout/MainLayout";
import { AuthProvider } from "../contexts/AuthContext";
import "./globals.css";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "Plateforme Municipale Intégrée",
	description: "Plateforme centralisée pour la gestion municipale.",
	manifest: "/manifest.json",
	icons: {
	//	apple: "/icon-192x192.png",
	},
};

export const viewport: Viewport = {
	themeColor: "#ffffff",
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="fr">
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased`}
			>
				<AuthProvider>
					<MainLayout>{children}</MainLayout>
				</AuthProvider>
			</body>
		</html>
	);
}

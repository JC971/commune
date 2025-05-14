import React from "react";
import Header from "../../components/layout/Header"; 
import Sidebar from "./SideBar"; // Ajustez le chemin si nécessaire (attention à la casse: SideBar vs Sidebar)
import Footer from "./Footer"; 
import "../../styles/MainLayout.css"; // Importez le fichier CSS

interface MainLayoutProps {
	children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
	return (
		// Conteneur principal de la mise en page
		<div className="main-layout-container">
			<Header />
			{/* Conteneur pour la sidebar et le contenu principal */}
			<div className="layout-body">
				<Sidebar />
				{/* Zone de contenu principal */}
				<main className="main-content-area">{children}</main>
			</div>
			<Footer />
		</div>
	);
};

export default MainLayout;

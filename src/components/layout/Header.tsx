import React from "react";
import Link from "next/link";
import { Menu } from "lucide-react"; // Using lucide-react installed earlier
import "../../styles/Header.css"; // Importez le fichier CSS

const Header: React.FC = () => {
	return (
		// Utilisation de classes CSS classiques
		<header className="app-header">
			<div className="header-logo-area">
				{/* Placeholder for a logo or icon */}
				{/* <PlaceholderIcon className="logo-icon" /> */}
				<Link href="/" className="header-logo-link">
					Plateforme Municipale Intégrée
				</Link>
			</div>

			{/* Navigation principale */}
			<nav className="header-nav">
				{/* TODO: Add actual navigation links based on user role */}
				<Link href="/deliberations" className="header-nav-link">
					Délibérations
				</Link>
				<Link href="/commissions" className="header-nav-link">
					Commissions
				</Link>
				<Link href="/services-techniques" className="header-nav-link">
					Services Techniques
				</Link>
				<Link href="/doleances" className="header-nav-link">
					Doléances
				</Link>
			</nav>

			{/* Contrôles utilisateur et menu mobile */}
			<div className="header-controls">
				{/* TODO: Add User profile/login button */}
				<button className="header-button user-button">
					{/* Placeholder for user icon */}
					{/* <User size={20} /> */} {/* Example using size prop */}
				</button>
				{/* Bouton pour ouvrir le menu sur mobile */}
				<button className="header-button menu-toggle-button">
					<Menu size={24} />{" "}
					{/* Using size prop is cleaner than CSS for icons */}
				</button>
			</div>
		</header>
	);
};

export default Header;

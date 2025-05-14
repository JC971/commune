"use client";

import React from "react";
import "../../styles/DeliberationsPage.css"; // Adaptez le chemin si vous avez mis le CSS ailleurs

const DeliberationsPage: React.FC = () => {
	return (
		// Ajoutez une classe au conteneur principal si vous l'avez définie dans le CSS
		<div className="deliberations-container">
			<h1 className="deliberations-title">Délibérations & Conseil Municipal</h1>
			{/* TODO: Implement deliberation list, search, filters, view */}
			<p className="deliberations-description">
				Section en cours de développement pour la gestion des délibérations.
			</p>
		</div>
	);
};

// TODO: Add role protection if needed
export default DeliberationsPage;

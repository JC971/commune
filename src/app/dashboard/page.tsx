"use client";

import React from "react";
import "../../styles/DashboardPage.css"; // Assurez-vous que ce chemin est correct
import { useAuth } from "../../contexts/AuthContext"; // ou "@/contexts/AuthContext"

// Définissez l'interface User si elle n'est pas importée d'ailleurs (normalement elle est dans AuthContext.tsx)
// Si elle est exportée depuis AuthContext.tsx, vous pouvez l'importer :
// import { useAuth, type User } from "../../contexts/AuthContext";
interface User {
	id: string;
	name: string;
	role: string;
}

const DashboardPage: React.FC = () => {
	const { user, isAuthenticated, login, logout } = useAuth();

	const handleFakeLogin = () => {
		// Simulez des données utilisateur pour le test
		const fakeUserData: User = {
			id: "123",
			name: "Djiss Test",
			role: "admin", // ou 'elu', 'agent_technique', etc.
		};
		login(fakeUserData);
	};

	if (!isAuthenticated) {
		return (
			<div className="dashboard-container">
				<h1 className="dashboard-title">Accès Restreint</h1>
				<p className="dashboard-welcome-message">
					Veuillez vous connecter pour accéder au tableau de bord.
				</p>
				<button onClick={handleFakeLogin} className="dashboard-login-button">
					Se connecter (Test)
				</button>
			</div>
		);
	}

	// Si isAuthenticated est true, user ne devrait pas être null
	// Mais pour la robustesse de TypeScript, on le vérifie.
	if (!user) {
		return (
			<div className="dashboard-container">
				<p>Erreur : utilisateur non trouvé malgré l authentification.</p>
				<button onClick={logout} className="dashboard-logout-button">
					Se déconnecter (Erreur)
				</button>
			</div>
		);
	}

	return (
		<div className="dashboard-container">
			<h1 className="dashboard-title">Tableau de Bord</h1>
			<p className="dashboard-welcome-message">
				Bienvenue sur la Plateforme Municipale Intégrée, {user.name}!
			</p>
			<p className="user-info">
				Vous êtes connecté en tant que : {user.name} (Rôle : {user.role})
			</p>
			<button onClick={logout} className="dashboard-logout-button">
				Se déconnecter
			</button>
		</div>
	);
};

export default DashboardPage;

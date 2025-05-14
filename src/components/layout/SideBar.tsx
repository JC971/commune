import React from "react";
import Link from "next/link";
import {
	LayoutDashboard,
	FileText,
	Users,
	Wrench,
	MessageSquareWarning,
} from "lucide-react";
import "../../styles/Sidebar.css"; // Importez le fichier CSS

const Sidebar: React.FC = () => {
	return (
		<aside className="sidebar-container">
			<nav className="sidebar-nav">
				<ul className="sidebar-list">
					<li>
						<Link href="/dashboard" className="sidebar-link">
							{/* Utilisation de la prop size pour la taille */}
							<LayoutDashboard size={20} className="sidebar-icon" />
							Tableau de Bord
						</Link>
					</li>
					<li>
						<Link href="/deliberations" className="sidebar-link">
							<FileText size={20} className="sidebar-icon" />
							Délibérations
						</Link>
					</li>
					<li>
						<Link href="/commissions" className="sidebar-link">
							<Users size={20} className="sidebar-icon" />
							Commissions
						</Link>
					</li>
					<li>
						<Link href="/services-techniques" className="sidebar-link">
							<Wrench size={20} className="sidebar-icon" />
							Services Techniques
						</Link>
					</li>
					<li>
						<Link href="/doleances" className="sidebar-link">
							<MessageSquareWarning size={20} className="sidebar-icon" />
							Doléances Citoyennes
						</Link>
					</li>
					{/* Ajoutez d'autres liens si nécessaire */}
				</ul>
			</nav>
			{/* Vous pouvez ajouter ici une section pied de page pour la sidebar si besoin */}
		</aside>
	);
};

export default Sidebar;

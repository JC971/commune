import React from "react";
import { Intervention } from "./InterventionList"; // Reuse the type
import {
	Wrench,
	MapPin,
	Clock,
	AlertTriangle,
	CheckCircle,
	Calendar,
	
	Users,
	DollarSign,
	Paperclip,
	MessageSquare,
} from "lucide-react";
// Assuming dynamic import for Leaflet components if used directly here
// import InterventionMap from './InterventionMap';

// Define types for related data based on SQL schema
interface InterventionStatusHistory {
	id: number;
	status: string;
	change_date: string; // Or Date object
	notes: string | null;
	// changed_by_user_name?: string; // If fetching user name
}

interface InterventionDocument {
	id: number;
	file_name: string;
	file_path: string;
	description: string | null;
	capture_time: string | null; // Or Date object
}

// Extend the Intervention type for detailed view
interface InterventionDetailData extends Intervention {
	description: string;
	planned_start_date: string | null;
	planned_end_date: string | null;
	actual_start_date: string | null;
	actual_end_date: string | null;
	assigned_agent_name?: string; // Joined from users table
	assigned_team_name?: string; // Joined from teams table
	estimated_cost: number | null;
	final_cost: number | null;
	cost_validated: boolean;
	originating_doleance_ref?: string; // Joined from doleances table
	status_history?: InterventionStatusHistory[];
	documents?: InterventionDocument[];
	// Blockchain info if needed
	blockchain_tx_hash?: string | null;
}

interface InterventionDetailProps {
	intervention: InterventionDetailData | null;
	loading: boolean;
	error: string | null;
}

// Helper to get status color and icon (can be shared)
const getStatusStyle = (status: string) => {
	switch (status) {
		case "created":
			return { color: "gray", Icon: Clock };
		case "planned":
			return { color: "blue", Icon: Clock };
		case "assigned":
			return { color: "purple", Icon: Wrench };
		case "in_progress":
			return { color: "orange", Icon: Wrench };
		case "completed":
			return { color: "green", Icon: CheckCircle };
		case "validated":
			return { color: "green", Icon: CheckCircle };
		case "cancelled":
			return { color: "red", Icon: AlertTriangle };
		default:
			return { color: "gray", Icon: Clock };
	}
};

const InterventionDetail: React.FC<InterventionDetailProps> = ({
	intervention,
	loading,
	error,
}) => {
	if (loading) {
		return <p>Chargement des détails de l&#39;intervention...</p>;
	}

	if (error) {
		return <p className="text-red-600">Erreur: {error}</p>;
	}

	if (!intervention) {
		return <p>Aucune intervention sélectionnée ou trouvée.</p>;
	}

	const { color, Icon } = getStatusStyle(intervention.status);

	return (
		<div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 space-y-6">
			{/* Header Section */}
			<div>
				<div className="flex justify-between items-start mb-2">
					<h2 className="text-2xl font-bold text-gray-800 flex items-center">
						<Wrench className={`h-6 w-6 mr-3 text-${color}-600`} />
						{intervention.title}
					</h2>
					<span
						className={`px-3 py-1 rounded-full text-sm font-medium bg-${color}-100 text-${color}-800 flex items-center`}
					>
						<Icon className="h-4 w-4 mr-1.5" />
						{intervention.status}
					</span>
				</div>
				<div className="text-sm text-gray-500 space-x-4">
					<span>Référence: {intervention.reference_code || "N/A"}</span>
					<span>Priorité: {intervention.priority}</span>
					<span>
						Type: {intervention.intervention_type_name || "Non spécifié"}
					</span>
				</div>
			</div>

			{/* Description */}
			<div>
				<h3 className="text-lg font-semibold mb-2 text-gray-700">
					Description
				</h3>
				<p className="text-gray-700 whitespace-pre-wrap">
					{intervention.description}
				</p>
			</div>

			{/* Location */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<div>
					<h3 className="text-lg font-semibold mb-2 text-gray-700 flex items-center">
						<MapPin className="h-5 w-5 mr-2 text-gray-500" /> Localisation
					</h3>
					<p className="text-sm text-gray-700">
						{intervention.address || "Adresse non spécifiée"}
					</p>
					{intervention.latitude && intervention.longitude && (
						<p className="text-xs text-gray-500">
							Lat: {intervention.latitude}, Lon: {intervention.longitude}
						</p>
						// TODO: Integrate InterventionMap component here
						// <div className="mt-2 h-48 w-full rounded overflow-hidden border">
						//   <InterventionMap intervention={intervention} />
						// </div>
					)}
				</div>
				{/* Dates */}
				<div>
					<h3 className="text-lg font-semibold mb-2 text-gray-700 flex items-center">
						<Calendar className="h-5 w-5 mr-2 text-gray-500" /> Dates
					</h3>
					<ul className="text-sm text-gray-700 space-y-1">
						<li>
							<strong>Créée le:</strong>{" "}
							{new Date(intervention.creation_date).toLocaleString("fr-FR")}
						</li>
						<li>
							<strong>Planifiée:</strong>{" "}
							{intervention.planned_start_date
								? `${new Date(
										intervention.planned_start_date
								  ).toLocaleDateString("fr-FR")} - ${
										intervention.planned_end_date
											? new Date(
													intervention.planned_end_date
											  ).toLocaleDateString("fr-FR")
											: "..."
								  }`
								: "Non planifiée"}
						</li>
						<li>
							<strong>Réalisée:</strong>{" "}
							{intervention.actual_start_date
								? `${new Date(
										intervention.actual_start_date
								  ).toLocaleDateString("fr-FR")} - ${
										intervention.actual_end_date
											? new Date(
													intervention.actual_end_date
											  ).toLocaleDateString("fr-FR")
											: "En cours"
								  }`
								: "Non débutée"}
						</li>
					</ul>
				</div>
			</div>

			{/* Assignment & Cost */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<div>
					<h3 className="text-lg font-semibold mb-2 text-gray-700 flex items-center">
						<Users className="h-5 w-5 mr-2 text-gray-500" /> Assignation
					</h3>
					<p className="text-sm text-gray-700">
						Agent: {intervention.assigned_agent_name || "Non assigné"}
					</p>
					{/* <p className="text-sm text-gray-700">Équipe: {intervention.assigned_team_name || 'N/A'}</p> */}
				</div>
				<div>
					<h3 className="text-lg font-semibold mb-2 text-gray-700 flex items-center">
						<DollarSign className="h-5 w-5 mr-2 text-gray-500" /> Coûts
					</h3>
					<p className="text-sm text-gray-700">
						Estimé:{" "}
						{intervention.estimated_cost !== null
							? `${intervention.estimated_cost} €`
							: "N/A"}
					</p>
					<p className="text-sm text-gray-700">
						Final:{" "}
						{intervention.final_cost !== null
							? `${intervention.final_cost} €`
							: "N/A"}{" "}
						{intervention.cost_validated && (
							<span title="Coût validé">
								<CheckCircle className="h-4 w-4 inline ml-1 text-green-600" />
							</span>
						)}
					</p>
				</div>
			</div>

			{/* Link to Doléance */}
			{intervention.originating_doleance_ref && (
				<div>
					<h3 className="text-lg font-semibold mb-2 text-gray-700 flex items-center">
						<MessageSquare className="h-5 w-5 mr-2 text-gray-500" /> Doléance
						Associée
					</h3>
					{/* TODO: Make this a link to the doléance page */}
					<p className="text-sm text-blue-600 hover:underline">
						Référence: {intervention.originating_doleance_ref}
					</p>
				</div>
			)}

			{/* Documents */}
			{intervention.documents && intervention.documents.length > 0 && (
				<div>
					<h3 className="text-lg font-semibold mb-3 text-gray-700 border-b pb-1 flex items-center">
						<Paperclip className="h-5 w-5 mr-2" /> Documents & Photos
					</h3>
					<ul className="list-disc pl-5 space-y-1">
						{intervention.documents.map((doc) => (
							<li key={doc.id}>
								<a
									href={doc.file_path}
									target="_blank"
									rel="noopener noreferrer"
									className="text-blue-600 hover:underline flex items-center text-sm"
								>
									<Paperclip className="h-4 w-4 mr-1 flex-shrink-0" />
									{doc.file_name}
									{doc.description && (
										<span className="text-gray-500 text-xs ml-2">
											({doc.description})
										</span>
									)}
									{doc.capture_time && (
										<span className="text-gray-400 text-xs ml-2">
											({new Date(doc.capture_time).toLocaleString("fr-FR")})
										</span>
									)}
								</a>
							</li>
						))}
					</ul>
				</div>
			)}

			{/* Status History */}
			{intervention.status_history &&
				intervention.status_history.length > 0 && (
					<div>
						<h3 className="text-lg font-semibold mb-3 text-gray-700 border-b pb-1 flex items-center">
							<Clock className="h-5 w-5 mr-2" /> Historique des Statuts
						</h3>
						<ul className="space-y-2">
							{intervention.status_history.map((history) => {
								const { color: historyColor, Icon: HistoryIcon } =
									getStatusStyle(history.status);
								return (
									<li key={history.id} className="flex items-start text-sm">
										<span
											className={`mr-3 mt-1 px-1.5 py-0.5 rounded-full text-xs font-medium bg-${historyColor}-100 text-${historyColor}-800 flex items-center flex-shrink-0`}
										>
											<HistoryIcon className="h-3 w-3 mr-1" />
											{history.status}
										</span>
										<span className="text-gray-500 mr-2 flex-shrink-0">
											{new Date(history.change_date).toLocaleString("fr-FR")}:
										</span>
										<span className="text-gray-700">
											{history.notes || "Statut mis à jour"}
										</span>
									</li>
								);
							})}
						</ul>
					</div>
				)}

			{/* TODO: Add Blockchain Info Section if applicable */}
			{/* TODO: Add buttons for Edit, Change Status, Upload Photo etc. based on role */}
		</div>
	);
};

export default InterventionDetail;

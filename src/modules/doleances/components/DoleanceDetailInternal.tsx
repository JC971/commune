import React from "react";
import { DoleanceInternal } from "../components/DoleanceListInternal"; // Reuse the type
import {
	MessageSquareWarning,
	MapPin,
	Clock,
	AlertTriangle,
	CheckCircle,
	User,
	Calendar,
	Mail,
	Phone,
	Paperclip,
	Link as LinkIcon,
} from "lucide-react";
// Assuming dynamic import for Leaflet components if used directly here
// import InterventionMap from '@/modules/services-techniques/components/InterventionMap';

// Define types for related data based on SQL schema
interface DoleanceStatusHistory {
	id: number;
	status: string;
	change_date: string; // Or Date object
	notes: string | null;
	is_public: boolean;
	// changed_by_user_name?: string; // If fetching user name
}

interface DoleanceAttachment {
	id: number;
	file_name: string;
	file_path: string;
	description: string | null;
}

// Extend the DoleanceInternal type for detailed view
interface DoleanceDetailData extends DoleanceInternal {
	description: string; // Full description
	latitude?: number | null;
	longitude?: number | null;
	submitter_name?: string | null;
	submitter_email?: string | null;
	submitter_phone?: string | null;
	is_anonymous: boolean;
	resolution_details?: string | null;
	closure_date?: string | null; // Or Date object
	linked_intervention_id?: number | null;
	linked_intervention_ref?: string | null; // Joined from interventions table
	status_history?: DoleanceStatusHistory[];
	attachments?: DoleanceAttachment[];
	// Blockchain info if needed
	blockchain_tx_hash?: string | null;
	initial_description_hash?: string | null;
}

interface DoleanceDetailInternalProps {
	doleance: DoleanceDetailData | null;
	loading: boolean;
	error: string | null;
}

// Helper to get status color and icon (can be shared or adapted)
const getDoleanceStatusStyle = (status: string) => {
	switch (status) {
		case "received":
			return { color: "blue", Icon: MessageSquareWarning };
		case "qualified":
			return { color: "purple", Icon: MessageSquareWarning };
		case "assigned":
			return { color: "orange", Icon: User };
		case "resolution_planned":
			return { color: "yellow", Icon: Clock };
		case "resolved":
			return { color: "green", Icon: CheckCircle };
		case "closed":
			return { color: "gray", Icon: CheckCircle };
		case "rejected":
			return { color: "red", Icon: AlertTriangle };
		default:
			return { color: "gray", Icon: MessageSquareWarning };
	}
};

const DoleanceDetailInternal: React.FC<DoleanceDetailInternalProps> = ({
	doleance,
	loading,
	error,
}) => {
	if (loading) {
		return <p>Chargement des détails de la doléance...</p>;
	}

	if (error) {
		return <p className="text-red-600">Erreur: {error}</p>;
	}

	if (!doleance) {
		return <p>Aucune doléance sélectionnée ou trouvée.</p>;
	}

	const { color, Icon } = getDoleanceStatusStyle(doleance.status);

	return (
		<div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 space-y-6">
			{/* Header Section */}
			<div>
				<div className="flex justify-between items-start mb-2">
					<h2 className="text-2xl font-bold text-gray-800 flex items-center">
						<MessageSquareWarning
							className={`h-6 w-6 mr-3 text-${color}-600`}
						/>
						Doléance: {doleance.reference_code}
					</h2>
					<span
						className={`px-3 py-1 rounded-full text-sm font-medium bg-${color}-100 text-${color}-800 flex items-center`}
					>
						<Icon className="h-4 w-4 mr-1.5" />
						{doleance.status}
					</span>
				</div>
				<div className="text-sm text-gray-500 space-x-4">
					<span>Catégorie: {doleance.category_name || "Non spécifiée"}</span>
					<span>Priorité: {doleance.priority}</span>
					<span>
						Soumis le:{" "}
						{new Date(doleance.submission_date).toLocaleString("fr-FR")}
					</span>
				</div>
			</div>

			{/* Description */}
			<div>
				<h3 className="text-lg font-semibold mb-2 text-gray-700">
					Description
				</h3>
				<p className="text-gray-700 whitespace-pre-wrap">
					{doleance.description}
				</p>
				{doleance.initial_description_hash && (
					<p className="text-xs text-gray-400 mt-1">
						Hash initial: {doleance.initial_description_hash.substring(0, 10)}
						...
					</p>
				)}
			</div>

			{/* Submitter Info */}
			<div>
				<h3 className="text-lg font-semibold mb-2 text-gray-700 flex items-center">
					<User className="h-5 w-5 mr-2 text-gray-500" /> Informations du
					Soumissionnaire
				</h3>
				{doleance.is_anonymous ? (
					<p className="text-sm text-gray-600 italic">Soumission anonyme.</p>
				) : (
					<div className="text-sm text-gray-700 space-y-1">
						{doleance.submitter_name && (
							<p>
								<User className="h-4 w-4 inline mr-1" /> Nom:{" "}
								{doleance.submitter_name}
							</p>
						)}
						{doleance.submitter_email && (
							<p>
								<Mail className="h-4 w-4 inline mr-1" /> Email:{" "}
								<a
									href={`mailto:${doleance.submitter_email}`}
									className="text-blue-600 hover:underline"
								>
									{doleance.submitter_email}
								</a>
							</p>
						)}
						{doleance.submitter_phone && (
							<p>
								<Phone className="h-4 w-4 inline mr-1" /> Téléphone:{" "}
								{doleance.submitter_phone}
							</p>
						)}
					</div>
				)}
			</div>

			{/* Location */}
			<div>
				<h3 className="text-lg font-semibold mb-2 text-gray-700 flex items-center">
					<MapPin className="h-5 w-5 mr-2 text-gray-500" /> Localisation
				</h3>
				<p className="text-sm text-gray-700">
					{doleance.address || "Adresse non spécifiée"}
				</p>
				{doleance.latitude && doleance.longitude && (
					<p className="text-xs text-gray-500">
						Lat: {doleance.latitude.toFixed(6)}, Lon:{" "}
						{doleance.longitude.toFixed(6)}
					</p>
					// TODO: Integrate Map component here if needed
					// <div className="mt-2 h-48 w-full rounded overflow-hidden border">
					//   <InterventionMap interventions={[doleance as any]} /> // Adapt map if needed
					// </div>
				)}
			</div>

			{/* Attachments */}
			{doleance.attachments && doleance.attachments.length > 0 && (
				<div>
					<h3 className="text-lg font-semibold mb-3 text-gray-700 border-b pb-1 flex items-center">
						<Paperclip className="h-5 w-5 mr-2" /> Pièces Jointes
					</h3>
					<ul className="list-disc pl-5 space-y-1">
						{doleance.attachments.map((att) => (
							<li key={att.id}>
								<a
									href={att.file_path}
									target="_blank"
									rel="noopener noreferrer"
									className="text-blue-600 hover:underline flex items-center text-sm"
								>
									<Paperclip className="h-4 w-4 mr-1 flex-shrink-0" />
									{att.file_name}
									{att.description && (
										<span className="text-gray-500 text-xs ml-2">
											({att.description})
										</span>
									)}
								</a>
							</li>
						))}
					</ul>
				</div>
			)}

			{/* Internal Processing Info */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
				<div>
					<h3 className="text-lg font-semibold mb-2 text-gray-700">
						Traitement Interne
					</h3>
					<p className="text-sm text-gray-700">
						Assigné à: {doleance.assigned_agent_name || "Non assigné"}
					</p>
					{doleance.linked_intervention_id && (
						<p className="text-sm text-gray-700 mt-1">
							<LinkIcon className="h-4 w-4 inline mr-1" /> Intervention liée:
							<Link
								href={`/services-techniques/${doleance.linked_intervention_id}`}
								className="text-blue-600 hover:underline ml-1"
							>
								{doleance.linked_intervention_ref ||
									doleance.linked_intervention_id}
							</Link>
						</p>
					)}
				</div>
				<div>
					<h3 className="text-lg font-semibold mb-2 text-gray-700">
						Résolution
					</h3>
					<p className="text-sm text-gray-700 whitespace-pre-wrap">
						{doleance.resolution_details || "Aucun détail de résolution."}
					</p>
					{doleance.closure_date && (
						<p className="text-xs text-gray-500 mt-1">
							Clôturé le:{" "}
							{new Date(doleance.closure_date).toLocaleString("fr-FR")}
						</p>
					)}
				</div>
			</div>

			{/* Status History */}
			{doleance.status_history && doleance.status_history.length > 0 && (
				<div>
					<h3 className="text-lg font-semibold mb-3 text-gray-700 border-b pb-1 flex items-center">
						<Clock className="h-5 w-5 mr-2" /> Historique des Statuts
					</h3>
					<ul className="space-y-2">
						{doleance.status_history.map((history) => {
							const { color: historyColor, Icon: HistoryIcon } =
								getDoleanceStatusStyle(history.status);
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
										{history.notes || "Statut mis à jour"}{" "}
										{history.is_public && (
											<span className="text-blue-500 text-xs ml-1">
												(Public)
											</span>
										)}
									</span>
								</li>
							);
						})}
					</ul>
				</div>
			)}

			{/* TODO: Add Blockchain Info Section if applicable */}
			{/* TODO: Add buttons for Edit, Change Status, Assign, Link Intervention etc. based on role */}
		</div>
	);
};

export default DoleanceDetailInternal;

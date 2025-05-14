import React from "react";
import { Commission } from "./CommissionList"; // Reuse the type
import { Users, Calendar, FileText, CheckSquare, Clock } from "lucide-react";

// Define types for related data based on SQL schema
interface CommissionMember {
	user_id: number;
	name: string; // Assuming we fetch user name
	role_in_commission: string | null;
}

interface CommissionMeeting {
	id: number;
	meeting_date: string; // Or Date object
	location: string | null;
	status: string;
}

interface CommissionDocument {
	id: number;
	file_name: string;
	file_path: string;
	description: string | null;
}

interface CommissionActionItem {
	id: number;
	description: string;
	status: string;
	due_date: string | null; // Or Date object
	assigned_to_name?: string; // Assuming we fetch assigned user name
}

// Extend the Commission type for detailed view
interface CommissionDetailData extends Commission {
	members?: CommissionMember[];
	meetings?: CommissionMeeting[];
	documents?: CommissionDocument[];
	action_items?: CommissionActionItem[];
}

interface CommissionDetailProps {
	commission: CommissionDetailData | null;
	loading: boolean;
	error: string | null;
}

const CommissionDetail: React.FC<CommissionDetailProps> = ({
	commission,
	loading,
	error,
}) => {
	if (loading) {
		return <p>Chargement des détails de la commission...</p>;
	}

	if (error) {
		return <p className="text-red-600">Erreur: {error}</p>;
	}

	if (!commission) {
		return <p>Aucune commission sélectionnée ou trouvée.</p>;
	}

	return (
		<div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 space-y-6">
			{/* Header Section */}
			<div>
				<h2 className="text-2xl font-bold mb-2 text-gray-800 flex items-center">
					<Users className="h-6 w-6 mr-3 text-blue-600" />
					{commission.name}
				</h2>
				{commission.description && (
					<p className="text-gray-600 mb-4">{commission.description}</p>
				)}
				<div className="flex items-center text-sm text-gray-500">
					<Calendar className="h-4 w-4 mr-2" />
					Créée le:{" "}
					{commission.creation_date
						? new Date(commission.creation_date).toLocaleDateString("fr-FR")
						: "N/A"}
					<span
						className={`ml-4 px-2 py-0.5 rounded-full text-xs font-medium ${
							commission.status === "active"
								? "bg-green-100 text-green-800"
								: "bg-gray-100 text-gray-800"
						}`}
					>
						{commission.status === "active" ? "Active" : "Archivée"}
					</span>
				</div>
			</div>

			{/* TODO: Add Tabs for Members, Meetings, Documents, Action Items */}

			{/* Example: Members Section */}
			{commission.members && commission.members.length > 0 && (
				<div>
					<h3 className="text-lg font-semibold mb-3 text-gray-700 border-b pb-1">
						Membres
					</h3>
					<ul className="space-y-2">
						{commission.members.map((member) => (
							<li key={member.user_id} className="flex items-center text-sm">
								<Users className="h-4 w-4 mr-2 text-gray-500" />
								{member.name}{" "}
								{member.role_in_commission && (
									<span className="text-gray-500 ml-2">
										({member.role_in_commission})
									</span>
								)}
							</li>
						))}
					</ul>
				</div>
			)}

			{/* Example: Meetings Section */}
			{commission.meetings && commission.meetings.length > 0 && (
				<div>
					<h3 className="text-lg font-semibold mb-3 text-gray-700 border-b pb-1">
						Réunions
					</h3>
					{/* TODO: Display meetings, maybe link to details */}
					<p className="text-sm text-gray-600">Liste des réunions...</p>
				</div>
			)}

			{/* Example: Documents Section */}
			{commission.documents && commission.documents.length > 0 && (
				<div>
					<h3 className="text-lg font-semibold mb-3 text-gray-700 border-b pb-1">
						Documents
					</h3>
					<ul className="list-disc pl-5 space-y-1">
						{commission.documents.map((doc) => (
							<li key={doc.id}>
								<a
									href={doc.file_path}
									target="_blank"
									rel="noopener noreferrer"
									className="text-blue-600 hover:underline flex items-center text-sm"
								>
									<FileText className="h-4 w-4 mr-1 flex-shrink-0" />
									{doc.file_name}
									{doc.description && (
										<span className="text-gray-500 text-xs ml-2">
											({doc.description})
										</span>
									)}
								</a>
							</li>
						))}
					</ul>
				</div>
			)}

			{/* Example: Action Items Section */}
			{commission.action_items && commission.action_items.length > 0 && (
				<div>
					<h3 className="text-lg font-semibold mb-3 text-gray-700 border-b pb-1">
						Actions à Suivre
					</h3>
					<ul className="space-y-3">
						{commission.action_items.map((item) => (
							<li
								key={item.id}
								className="text-sm border-l-4 pl-3 ${item.status === 'completed' ? 'border-green-500' : 'border-orange-500'}"
							>
								<p className="font-medium text-gray-800">{item.description}</p>
								<div className="flex items-center text-xs text-gray-500 mt-1">
									<CheckSquare className="h-3 w-3 mr-1" /> Statut: {item.status}
									{item.assigned_to_name && (
										<span className="ml-3">
											<Users className="h-3 w-3 mr-1 inline" /> Assigné à:{" "}
											{item.assigned_to_name}
										</span>
									)}
									{item.due_date && (
										<span className="ml-3">
											<Clock className="h-3 w-3 mr-1 inline" /> Échéance:{" "}
											{new Date(item.due_date).toLocaleDateString("fr-FR")}
										</span>
									)}
								</div>
							</li>
						))}
					</ul>
				</div>
			)}

			{/* TODO: Add buttons for Edit, Add Meeting, Upload Document etc. based on role */}
		</div>
	);
};

export default CommissionDetail;

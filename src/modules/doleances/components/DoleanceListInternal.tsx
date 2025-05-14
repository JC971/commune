import React from "react";
import Link from "next/link";
import {
	MessageSquareWarning,
	MapPin,
	Clock,
	AlertTriangle,
	CheckCircle,
	User,
} from "lucide-react";

// Define a type for Doleance data for internal listing (based on SQL schema)
export interface DoleanceInternal {
	id: number;
	reference_code: string;
	description: string; // Maybe truncated
	status: string;
	priority: string;
	submission_date: string; // Or Date object
	address: string | null;
	category_name?: string; // Joined from doleance_categories
	assigned_agent_name?: string; // Joined from users
}

interface DoleanceListInternalProps {
	doleances: DoleanceInternal[];
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

const DoleanceListInternal: React.FC<DoleanceListInternalProps> = ({
	doleances,
}) => {
	if (!doleances || doleances.length === 0) {
		return <p>Aucune doléance trouvée.</p>;
	}

	return (
		<div className="overflow-x-auto">
			<table className="min-w-full bg-white border border-gray-200">
				<thead className="bg-gray-100">
					<tr>
						<th className="px-4 py-2 border-b text-left text-sm font-medium text-gray-600">
							Référence
						</th>
						<th className="px-4 py-2 border-b text-left text-sm font-medium text-gray-600">
							Description (Extrait)
						</th>
						<th className="px-4 py-2 border-b text-left text-sm font-medium text-gray-600">
							Catégorie
						</th>
						<th className="px-4 py-2 border-b text-left text-sm font-medium text-gray-600">
							Statut
						</th>
						<th className="px-4 py-2 border-b text-left text-sm font-medium text-gray-600">
							Priorité
						</th>
						<th className="px-4 py-2 border-b text-left text-sm font-medium text-gray-600">
							Date Soumission
						</th>
						<th className="px-4 py-2 border-b text-left text-sm font-medium text-gray-600">
							Assigné à
						</th>
						<th className="px-4 py-2 border-b text-left text-sm font-medium text-gray-600">
							Actions
						</th>
					</tr>
				</thead>
				<tbody>
					{doleances.map((doleance) => {
						const { color, Icon } = getDoleanceStatusStyle(doleance.status);
						return (
							<tr key={doleance.id} className="hover:bg-gray-50">
								<td className="px-4 py-2 border-b text-sm text-gray-800 font-mono">
									{doleance.reference_code}
								</td>
								<td
									className="px-4 py-2 border-b text-sm text-gray-800 max-w-xs truncate"
									title={doleance.description}
								>
									{doleance.description}
								</td>
								<td className="px-4 py-2 border-b text-sm text-gray-800">
									{doleance.category_name || "-"}
								</td>
								<td className="px-4 py-2 border-b text-sm text-gray-800">
									<span
										className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-${color}-100 text-${color}-800`}
									>
										<Icon className="h-3 w-3 mr-1" />
										{doleance.status}
									</span>
								</td>
								<td className="px-4 py-2 border-b text-sm text-gray-800">
									{doleance.priority}
								</td>
								<td className="px-4 py-2 border-b text-sm text-gray-800">
									{new Date(doleance.submission_date).toLocaleDateString(
										"fr-FR"
									)}
								</td>
								<td className="px-4 py-2 border-b text-sm text-gray-800">
									{doleance.assigned_agent_name || "-"}
								</td>
								<td className="px-4 py-2 border-b text-sm text-gray-800">
									<Link
										href={`/doleances/${doleance.id}`}
										className="text-blue-600 hover:underline text-sm"
									>
										Voir
									</Link>
									{/* TODO: Add Edit/Assign buttons based on role */}
								</td>
							</tr>
						);
					})}
				</tbody>
			</table>
		</div>
	);
};

export default DoleanceListInternal;

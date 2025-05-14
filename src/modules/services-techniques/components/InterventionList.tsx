import React from "react";
import Link from "next/link";
import {
	Wrench,
	MapPin,
	Clock,
	AlertTriangle,
	CheckCircle,
} from "lucide-react";

// Define a type for Intervention data (based on SQL schema)
export interface Intervention {
	id: number;
	title: string;
	reference_code: string | null;
	status: string;
	priority: string;
	creation_date: string; // Or Date object
	address: string | null;
	latitude?: number | null;
	longitude?: number | null;
	intervention_type_name?: string; // Joined from intervention_types table
}

interface InterventionListProps {
	interventions: Intervention[];
}

// Helper to get status color and icon
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

const InterventionList: React.FC<InterventionListProps> = ({
	interventions,
}) => {
	if (!interventions || interventions.length === 0) {
		return <p>Aucune intervention trouvée.</p>;
	}

	return (
		<div className="space-y-4">
			{interventions.map((intervention) => {
				const { color, Icon } = getStatusStyle(intervention.status);
				return (
					<Link
						key={intervention.id}
						href={`/services-techniques/${intervention.id}`}
						className="block p-4 bg-white border border-gray-200 rounded-lg shadow hover:shadow-md transition-shadow"
					>
						<div className="flex justify-between items-start mb-2">
							<h3 className="text-md font-semibold text-gray-800 flex items-center">
								<Wrench className={`h-5 w-5 mr-2 text-${color}-600`} />
								{intervention.title}
							</h3>
							<span
								className={`px-2 py-0.5 rounded-full text-xs font-medium bg-${color}-100 text-${color}-800 flex items-center`}
							>
								<Icon className="h-3 w-3 mr-1" />
								{intervention.status}
							</span>
						</div>
						<div className="text-sm text-gray-600 space-y-1">
							{intervention.reference_code && (
								<p>
									<strong>Référence:</strong> {intervention.reference_code}
								</p>
							)}
							{intervention.intervention_type_name && (
								<p>
									<strong>Type:</strong> {intervention.intervention_type_name}
								</p>
							)}
							{intervention.address && (
								<p className="flex items-center">
									<MapPin className="h-4 w-4 mr-1 text-gray-400 flex-shrink-0" />{" "}
									{intervention.address}
								</p>
							)}
							<p className="flex items-center text-xs text-gray-500">
								<Clock className="h-3 w-3 mr-1" /> Créée le:{" "}
								{new Date(intervention.creation_date).toLocaleDateString(
									"fr-FR"
								)}
								<span className="ml-3">Priorité: {intervention.priority}</span>
							</p>
						</div>
					</Link>
				);
			})}
		</div>
	);
};

export default InterventionList;

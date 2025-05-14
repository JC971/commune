import React from "react";
import Link from "next/link";
import { Users, Calendar } from "lucide-react";

// Define a type for Commission data (based on SQL schema)
export interface Commission {
	id: number;
	name: string;
	description: string | null;
	creation_date: string | null; // Or Date object
	status: string;
	// Maybe add member count or next meeting date later
}

interface CommissionListProps {
	commissions: Commission[];
}

const CommissionList: React.FC<CommissionListProps> = ({ commissions }) => {
	if (!commissions || commissions.length === 0) {
		return <p>Aucune commission trouvée.</p>;
	}

	return (
		<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
			{commissions.map((commission) => (
				<Link
					key={commission.id}
					href={`/commissions/${commission.id}`}
					className="block p-4 bg-white border border-gray-200 rounded-lg shadow hover:shadow-md transition-shadow"
				>
					<h3 className="text-lg font-semibold text-blue-700 mb-2 flex items-center">
						<Users className="h-5 w-5 mr-2 flex-shrink-0" />
						{commission.name}
					</h3>
					{commission.description && (
						<p className="text-sm text-gray-600 mb-3 line-clamp-2">
							{commission.description}
						</p>
					)}
					<div className="flex justify-between items-center text-xs text-gray-500">
						<span className="flex items-center">
							<Calendar className="h-3 w-3 mr-1" />
							Créée le:{" "}
							{commission.creation_date
								? new Date(commission.creation_date).toLocaleDateString("fr-FR")
								: "N/A"}
						</span>
						<span
							className={`px-2 py-0.5 rounded-full text-xs font-medium ${
								commission.status === "active"
									? "bg-green-100 text-green-800"
									: "bg-gray-100 text-gray-800"
							}`}
						>
							{commission.status === "active" ? "Active" : "Archivée"}
						</span>
					</div>
				</Link>
			))}
		</div>
	);
};

export default CommissionList;

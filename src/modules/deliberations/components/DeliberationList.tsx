import React from "react";

// Define a type for Deliberation data (based on SQL schema)
export interface Deliberation {
	id: number;
	title: string;
	session_date: string; // Or Date object
	reference_code: string | null;
	summary: string | null;
	status: string;
	published_at: string | null; // Or Date object
}

interface DeliberationListProps {
	deliberations: Deliberation[];
}

const DeliberationList: React.FC<DeliberationListProps> = ({
	deliberations,
}) => {
	if (!deliberations || deliberations.length === 0) {
		return <p>Aucune délibération trouvée.</p>;
	}

	return (
		<div className="overflow-x-auto">
			<table className="min-w-full bg-white border border-gray-200">
				<thead className="bg-gray-100">
					<tr>
						<th className="px-4 py-2 border-b text-left text-sm font-medium text-gray-600">
							Titre
						</th>
						<th className="px-4 py-2 border-b text-left text-sm font-medium text-gray-600">
							Date Session
						</th>
						<th className="px-4 py-2 border-b text-left text-sm font-medium text-gray-600">
							Référence
						</th>
						<th className="px-4 py-2 border-b text-left text-sm font-medium text-gray-600">
							Statut
						</th>
						<th className="px-4 py-2 border-b text-left text-sm font-medium text-gray-600">
							Actions
						</th>
					</tr>
				</thead>
				<tbody>
					{deliberations.map((delib) => (
						<tr key={delib.id} className="hover:bg-gray-50">
							<td className="px-4 py-2 border-b text-sm text-gray-800">
								{delib.title}
							</td>
							<td className="px-4 py-2 border-b text-sm text-gray-800">
								{new Date(delib.session_date).toLocaleDateString("fr-FR")}
							</td>
							<td className="px-4 py-2 border-b text-sm text-gray-800">
								{delib.reference_code || "-"}
							</td>
							<td className="px-4 py-2 border-b text-sm text-gray-800">
								{/* TODO: Add badge/styling for status */}
								{delib.status}
							</td>
							<td className="px-4 py-2 border-b text-sm text-gray-800">
								{/* TODO: Add view/edit buttons based on role */}
								<button className="text-blue-600 hover:underline text-sm">
									Voir
								</button>
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
};

export default DeliberationList;

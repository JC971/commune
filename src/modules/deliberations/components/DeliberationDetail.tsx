import React from "react";
import { Deliberation } from "./DeliberationList"; // Reuse the type
import { FileText, Calendar, Tag, Users, Paperclip } from "lucide-react";

// Extend the Deliberation type for detailed view
interface DeliberationDetailData extends Deliberation {
	full_text?: string | null;
	decision_key?: string | null;
	speakers?: { id: number; name: string }[];
	themes?: { id: number; name: string }[];
	annexes?: {
		id: number;
		file_name: string;
		file_path: string;
		description?: string | null;
	}[];
}

interface DeliberationDetailProps {
	deliberation: DeliberationDetailData | null;
	loading: boolean;
	error: string | null;
}

const DeliberationDetail: React.FC<DeliberationDetailProps> = ({
	deliberation,
	loading,
	error,
}) => {
	if (loading) {
		return <p>Chargement des détails de la délibération...</p>;
	}

	if (error) {
		return <p className="text-red-600">Erreur: {error}</p>;
	}

	if (!deliberation) {
		return <p>Aucune délibération sélectionnée ou trouvée.</p>;
	}

	return (
		<div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
			<h2 className="text-xl font-bold mb-4 text-gray-800">
				{deliberation.title}
			</h2>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 text-sm text-gray-600">
				<div className="flex items-center">
					<Calendar className="h-4 w-4 mr-2 text-gray-500" />
					<strong>Date de session:</strong>&nbsp;
					{new Date(deliberation.session_date).toLocaleDateString("fr-FR")}
				</div>
				<div className="flex items-center">
					<Tag className="h-4 w-4 mr-2 text-gray-500" />
					<strong>Référence:</strong>&nbsp;
					{deliberation.reference_code || "N/A"}
				</div>
				<div className="flex items-center">
					<Tag className="h-4 w-4 mr-2 text-gray-500" />
					<strong>Statut:</strong>&nbsp;{deliberation.status}
				</div>
				{deliberation.published_at && (
					<div className="flex items-center">
						<Calendar className="h-4 w-4 mr-2 text-gray-500" />
						<strong>Publié le:</strong>&nbsp;
						{new Date(deliberation.published_at).toLocaleDateString("fr-FR")}
					</div>
				)}
			</div>

			{deliberation.summary && (
				<div className="mb-6">
					<h3 className="text-md font-semibold mb-2 text-gray-700">Résumé</h3>
					<p className="text-gray-700 whitespace-pre-wrap">
						{deliberation.summary}
					</p>
				</div>
			)}

			{deliberation.decision_key && (
				<div className="mb-6">
					<h3 className="text-md font-semibold mb-2 text-gray-700">
						Décision Clé
					</h3>
					<p className="text-gray-700 whitespace-pre-wrap">
						{deliberation.decision_key}
					</p>
				</div>
			)}

			{deliberation.full_text && (
				<div className="mb-6">
					<h3 className="text-md font-semibold mb-2 text-gray-700">
						Texte Intégral
					</h3>
					{/* TODO: Consider rendering Markdown or using a dedicated viewer */}
					<div className="prose max-w-none text-gray-800 border p-4 rounded bg-gray-50">
						{deliberation.full_text}
					</div>
				</div>
			)}

			{/* TODO: Add sections for Speakers, Themes, Annexes if data exists */}
			{deliberation.annexes && deliberation.annexes.length > 0 && (
				<div className="mb-6">
					<h3 className="text-md font-semibold mb-2 text-gray-700">Annexes</h3>
					<ul className="list-disc pl-5 space-y-1">
						{deliberation.annexes.map((annex) => (
							<li key={annex.id}>
								<a
									href={annex.file_path}
									target="_blank"
									rel="noopener noreferrer"
									className="text-blue-600 hover:underline flex items-center"
								>
									<Paperclip className="h-4 w-4 mr-1 flex-shrink-0" />
									{annex.file_name}
									{annex.description && (
										<span className="text-gray-500 text-xs ml-2">
											({annex.description})
										</span>
									)}
								</a>
							</li>
						))}
					</ul>
				</div>
			)}

			{/* TODO: Add TTS button, AI Summary button */}
		</div>
	);
};

export default DeliberationDetail;

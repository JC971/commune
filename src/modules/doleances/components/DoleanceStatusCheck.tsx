"use client";

import React, { useState } from "react";
import {
	Search,
	Loader2,
	Info,
	CheckCircle,
	AlertTriangle,
} from "lucide-react";

// Define the structure for public status information
interface DoleancePublicStatus {
	reference_code: string;
	status: string;
	submission_date: string; // Or Date object
	last_update_date: string; // Or Date object
	public_notes?: string | null; // Optional public notes about the status
}

const DoleanceStatusCheck: React.FC = () => {
	const [referenceCode, setReferenceCode] = useState("");
	const [statusInfo, setStatusInfo] = useState<DoleancePublicStatus | null>(
		null
	);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleSearch = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!referenceCode.trim()) {
			setError("Veuillez entrer un numéro de suivi.");
			setStatusInfo(null);
			return;
		}

		setIsLoading(true);
		setError(null);
		setStatusInfo(null);

		try {
			// Use the dedicated public API route
			const response = await fetch(
				`/api/doleances/public/${encodeURIComponent(referenceCode.trim())}`
			);

			if (!response.ok) {
				if (response.status === 404) {
					throw new Error("Numéro de suivi non trouvé.");
				} else {
					const errorData = await response.json();
					throw new Error(
						errorData.message ||
							"Une erreur est survenue lors de la récupération du statut."
					);
				}
			}

			const data: DoleancePublicStatus = await response.json();
			setStatusInfo(data);
		} catch (err: unknown) {
			if (err instanceof Error) {
				setError(err.message || "Une erreur inattendue est survenue.");
			} else {
				setError("Une erreur inattendue est survenue.");
			}
		} finally {
			setIsLoading(false);
		}
	};

	// Helper to get status icon (simplified version)
	const getStatusIcon = (status: string) => {
		if (status.includes("résolu") || status.includes("closed"))
			return <CheckCircle className="h-5 w-5 text-green-600" />;
		if (status.includes("rejeté") || status.includes("cancelled"))
			return <AlertTriangle className="h-5 w-5 text-red-600" />;
		return <Info className="h-5 w-5 text-blue-600" />;
	};

	return (
		<div className="p-6 bg-white rounded-lg shadow border border-gray-200 max-w-md mx-auto">
			<h3 className="text-lg font-medium text-gray-800 mb-4 text-center">
				Vérifier le statut de votre signalement
			</h3>
			<form
				onSubmit={handleSearch}
				className="flex items-center space-x-2 mb-4"
			>
				<input
					type="text"
					value={referenceCode}
					onChange={(e) => setReferenceCode(e.target.value)}
					placeholder="Entrez votre numéro de suivi..."
					required
					className="flex-grow px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
				/>
				<button
					type="submit"
					disabled={isLoading}
					className="p-2 border border-blue-600 rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
				>
					{isLoading ? (
						<Loader2 className="h-5 w-5 animate-spin" />
					) : (
						<Search className="h-5 w-5" />
					)}
				</button>
			</form>

			{error && (
				<p className="text-red-600 bg-red-100 p-3 rounded text-sm text-center">
					{error}
				</p>
			)}

			{statusInfo && (
				<div className="mt-4 p-4 border border-gray-200 rounded bg-gray-50 space-y-2">
					<p className="text-sm font-medium text-gray-700">
						Référence:{" "}
						<span className="font-mono font-bold">
							{statusInfo.reference_code}
						</span>
					</p>
					<p className="text-sm text-gray-700 flex items-center">
						Statut:
						<span className="font-semibold ml-2 flex items-center">
							{getStatusIcon(statusInfo.status)}
							<span className="ml-1.5">{statusInfo.status}</span>
						</span>
					</p>
					<p className="text-xs text-gray-500">
						Soumis le:{" "}
						{new Date(statusInfo.submission_date).toLocaleDateString("fr-FR")}
					</p>
					<p className="text-xs text-gray-500">
						Dernière mise à jour:{" "}
						{new Date(statusInfo.last_update_date).toLocaleDateString("fr-FR")}
					</p>
					{statusInfo.public_notes && (
						<p className="text-sm text-gray-600 border-t pt-2 mt-2">
							Note: {statusInfo.public_notes}
						</p>
					)}
				</div>
			)}
		</div>
	);
};

export default DoleanceStatusCheck;

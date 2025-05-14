import React, { useState, useEffect } from "react";
import { Commission } from "./CommissionList"; // Reuse the type

interface CommissionFormProps {
	commission?: Commission | null; // Optional: Pass existing commission for editing
	onSubmit: (
		formData: Omit<Commission, "id" | "status"> & { status?: string }
	) => void; // Adjust type as needed
	onCancel: () => void;
	isLoading: boolean;
}

const CommissionForm: React.FC<CommissionFormProps> = ({
	commission,
	onSubmit,
	onCancel,
	isLoading,
}) => {
	const [name, setName] = useState("");
	const [description, setDescription] = useState("");
	const [creationDate, setCreationDate] = useState("");
	const [status, setStatus] = useState("active"); // Default status

	useEffect(() => {
		if (commission) {
			setName(commission.name || "");
			setDescription(commission.description || "");
			setCreationDate(
				commission.creation_date ? commission.creation_date.split("T")[0] : ""
			); // Format date for input
			setStatus(commission.status || "active");
		} else {
			// Reset form for creation
			setName("");
			setDescription("");
			setCreationDate(new Date().toISOString().split("T")[0]); // Default to today
			setStatus("active");
		}
	}, [commission]);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		const formData = {
			name,
			description: description || null,
			creation_date: creationDate || null,
			status, // Include status for creation/update
		};
		onSubmit(formData);
	};

	return (
		<form
			onSubmit={handleSubmit}
			className="space-y-4 p-6 bg-white rounded-lg shadow border border-gray-200"
		>
			<h3 className="text-lg font-medium leading-6 text-gray-900">
				{commission
					? "Modifier la Commission"
					: "Créer une Nouvelle Commission"}
			</h3>

			<div>
				<label
					htmlFor="commission-name"
					className="block text-sm font-medium text-gray-700"
				>
					Nom de la commission <span className="text-red-500">*</span>
				</label>
				<input
					type="text"
					id="commission-name"
					value={name}
					onChange={(e) => setName(e.target.value)}
					required
					className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
				/>
			</div>

			<div>
				<label
					htmlFor="commission-description"
					className="block text-sm font-medium text-gray-700"
				>
					Description
				</label>
				<textarea
					id="commission-description"
					rows={3}
					value={description}
					onChange={(e) => setDescription(e.target.value)}
					className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
				/>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<div>
					<label
						htmlFor="commission-creation-date"
						className="block text-sm font-medium text-gray-700"
					>
						Date de création
					</label>
					<input
						type="date"
						id="commission-creation-date"
						value={creationDate}
						onChange={(e) => setCreationDate(e.target.value)}
						className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
					/>
				</div>
				<div>
					<label
						htmlFor="commission-status"
						className="block text-sm font-medium text-gray-700"
					>
						Statut
					</label>
					<select
						id="commission-status"
						value={status}
						onChange={(e) => setStatus(e.target.value)}
						className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
					>
						<option value="active">Active</option>
						<option value="archived">Archivée</option>
					</select>
				</div>
			</div>

			<div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
				<button
					type="button"
					onClick={onCancel}
					disabled={isLoading}
					className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
				>
					Annuler
				</button>
				<button
					type="submit"
					disabled={isLoading}
					className="inline-flex justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
				>
					{isLoading
						? "Enregistrement..."
						: commission
						? "Mettre à jour"
						: "Créer"}
				</button>
			</div>
		</form>
	);
};

export default CommissionForm;

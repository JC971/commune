"use client";

import React, { useState, useEffect } from "react";
import { Intervention } from "./InterventionList"; // Reuse the type

interface ExtendedIntervention extends Intervention {
	description?: string;
	intervention_type_id?: number;
	planned_start_date?: string;
	planned_end_date?: string;
	assigned_agent_id?: number;
	estimated_cost?: number | string;
}

// Assume InterventionType and User types are fetched or available
interface InterventionType {
	id: number;
	name: string;
}

interface User {
	id: number;
	name: string;
}

interface InterventionFormProps {
	intervention?: Intervention | null; // Optional: Pass existing intervention for editing
	interventionTypes: InterventionType[]; // Pass fetched types
	agents: User[]; // Pass fetched agents (users)
	onSubmit: (formData: {
		title: string;
		description: string;
		intervention_type_id: number | null;
		status: string;
		priority: string;
		address: string | null;
		latitude: number | string | null;
		longitude: number | string | null;
		planned_start_date: string | null;
		planned_end_date: string | null;
		assigned_agent_id: number | null;
		estimated_cost: number | string | null;
	}) => void;
	onCancel: () => void;
	isLoading: boolean;
}

const InterventionForm: React.FC<InterventionFormProps> = ({
	intervention,
	interventionTypes,
	agents,
	onSubmit,
	onCancel,
	isLoading,
}) => {
	// Form state - initialize with intervention data or defaults
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [interventionTypeId, setInterventionTypeId] = useState<number | string>(
		""
	);
	const [status, setStatus] = useState("created");
	const [priority, setPriority] = useState("medium");
	const [address, setAddress] = useState("");
	const [latitude, setLatitude] = useState<number | string>("");
	const [longitude, setLongitude] = useState<number | string>("");
			setDescription((intervention as ExtendedIntervention).description || ""); // Assuming description is fetched for detail
	const [plannedStartDate, setPlannedStartDate] = useState("");
	const [plannedEndDate, setPlannedEndDate] = useState("");
	const [assignedAgentId, setAssignedAgentId] = useState<number | string>("");
	const [estimatedCost, setEstimatedCost] = useState<number | string>("");
	// Add state for actual dates, final cost etc. if editable here

	useEffect(() => {
		if (intervention) {
			setTitle(intervention.title || "");
			setDescription((intervention as ExtendedIntervention).description || ""); // Assuming description is fetched for detail
			setInterventionTypeId((intervention as ExtendedIntervention).intervention_type_id || "");
			setStatus(intervention.status || "created");
			setPriority(intervention.priority || "medium");
			setAddress(intervention.address || "");
			setLatitude(intervention.latitude || "");
			setLongitude(intervention.longitude || "");
			setPlannedStartDate(
				(intervention as ExtendedIntervention).planned_start_date?.split("T")[0] || ""
			);
			setPlannedEndDate(
				(intervention as ExtendedIntervention).planned_end_date?.split("T")[0] || ""
			);
			setAssignedAgentId((intervention as ExtendedIntervention).assigned_agent_id || "");
			setEstimatedCost((intervention as ExtendedIntervention).estimated_cost || "");
		} else {
			// Reset form for creation
			setTitle("");
			setDescription("");
			setInterventionTypeId("");
			setStatus("created");
			setPriority("medium");
			setAddress("");
			setLatitude("");
			setLongitude("");
			setPlannedStartDate("");
			setPlannedEndDate("");
			setAssignedAgentId("");
			setEstimatedCost("");
		}
	}, [intervention]);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		const formData = {
			title,
			description,
			intervention_type_id: interventionTypeId ? Number(interventionTypeId) : null,
			status,
			priority,
			address: address || null,
			latitude: latitude ? Number(latitude) : null,
			longitude: longitude ? Number(longitude) : null,
			planned_start_date: plannedStartDate || null,
			planned_end_date: plannedEndDate || null,
			assigned_agent_id: assignedAgentId ? Number(assignedAgentId) : null,
			estimated_cost: estimatedCost ? Number(estimatedCost) : null,
			// Include other fields as needed
		};
		onSubmit(formData);
	};

	return (
		<form
			onSubmit={handleSubmit}
			className="space-y-4 p-6 bg-white rounded-lg shadow border border-gray-200"
		>
			<h3 className="text-lg font-medium leading-6 text-gray-900">
				{intervention
					? "Modifier l'Intervention"
					: "Créer une Nouvelle Intervention"}
			</h3>

			{/* Title and Description */}
			<div>
				<label
					htmlFor="intervention-title"
					className="block text-sm font-medium text-gray-700"
				>
					Titre <span className="text-red-500">*</span>
				</label>
				<input
					type="text"
					id="intervention-title"
					value={title}
					onChange={(e) => setTitle(e.target.value)}
					required
					className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
				/>
			</div>
			<div>
				<label
					htmlFor="intervention-description"
					className="block text-sm font-medium text-gray-700"
				>
					Description <span className="text-red-500">*</span>
				</label>
				<textarea
					id="intervention-description"
					rows={4}
					value={description}
					onChange={(e) => setDescription(e.target.value)}
					required
					className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
				/>
			</div>

			{/* Type, Status, Priority */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				<div>
					<label
						htmlFor="intervention-type"
						className="block text-sm font-medium text-gray-700"
					>
						Type
					</label>
					<select
						id="intervention-type"
						value={interventionTypeId}
						onChange={(e) =>
							setInterventionTypeId(
								e.target.value ? parseInt(e.target.value) : ""
							)
						}
						className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
					>
						<option value="">-- Sélectionner --</option>
						{interventionTypes.map((type) => (
							<option key={type.id} value={type.id}>
								{type.name}
							</option>
						))}
					</select>
				</div>
				<div>
					<label
						htmlFor="intervention-status"
						className="block text-sm font-medium text-gray-700"
					>
						Statut
					</label>
					<select
						id="intervention-status"
						value={status}
						onChange={(e) => setStatus(e.target.value)}
						className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
					>
						{/* TODO: Populate with actual statuses from specs */}
						<option value="created">Créé</option>
						<option value="planned">Planifié</option>
						<option value="assigned">Assigné</option>
						<option value="in_progress">En cours</option>
						<option value="completed">Terminé</option>
						<option value="validated">Validé</option>
						<option value="cancelled">Annulé</option>
					</select>
				</div>
				<div>
					<label
						htmlFor="intervention-priority"
						className="block text-sm font-medium text-gray-700"
					>
						Priorité
					</label>
					<select
						id="intervention-priority"
						value={priority}
						onChange={(e) => setPriority(e.target.value)}
						className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
					>
						<option value="low">Basse</option>
						<option value="medium">Moyenne</option>
						<option value="high">Haute</option>
						<option value="urgent">Urgente</option>
					</select>
				</div>
			</div>

			{/* Address and Coordinates */}
			<div>
				<label
					htmlFor="intervention-address"
					className="block text-sm font-medium text-gray-700"
				>
					Adresse
				</label>
				<input
					type="text"
					id="intervention-address"
					value={address}
					onChange={(e) => setAddress(e.target.value)}
					className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
				/>
			</div>
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<div>
					<label
						htmlFor="intervention-latitude"
						className="block text-sm font-medium text-gray-700"
					>
						Latitude
					</label>
					<input
						type="number"
						step="any"
						id="intervention-latitude"
						value={latitude}
						onChange={(e) => setLatitude(e.target.value)}
						className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
					/>
				</div>
				<div>
					<label
						htmlFor="intervention-longitude"
						className="block text-sm font-medium text-gray-700"
					>
						Longitude
					</label>
					<input
						type="number"
						step="any"
						id="intervention-longitude"
						value={longitude}
						onChange={(e) => setLongitude(e.target.value)}
						className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
					/>
				</div>
			</div>

			{/* Planned Dates */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<div>
					<label
						htmlFor="intervention-planned-start"
						className="block text-sm font-medium text-gray-700"
					>
						Date début planifiée
					</label>
					<input
						type="date"
						id="intervention-planned-start"
						value={plannedStartDate}
						onChange={(e) => setPlannedStartDate(e.target.value)}
						className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
					/>
				</div>
				<div>
					<label
						htmlFor="intervention-planned-end"
						className="block text-sm font-medium text-gray-700"
					>
						Date fin planifiée
					</label>
					<input
						type="date"
						id="intervention-planned-end"
						value={plannedEndDate}
						onChange={(e) => setPlannedEndDate(e.target.value)}
						className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
					/>
				</div>
			</div>

			{/* Assignment and Cost */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<div>
					<label
						htmlFor="intervention-agent"
						className="block text-sm font-medium text-gray-700"
					>
						Agent Assigné
					</label>
					<select
						id="intervention-agent"
						value={assignedAgentId}
						onChange={(e) =>
							setAssignedAgentId(e.target.value ? parseInt(e.target.value) : "")
						}
						className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
					>
						<option value="">-- Non assigné --</option>
						{agents.map((agent) => (
							<option key={agent.id} value={agent.id}>
								{agent.name}
							</option>
						))}
					</select>
				</div>
				<div>
					<label
						htmlFor="intervention-cost"
						className="block text-sm font-medium text-gray-700"
					>
						Coût Estimé (€)
					</label>
					<input
						type="number"
						step="0.01"
						id="intervention-cost"
						value={estimatedCost}
						onChange={(e) => setEstimatedCost(e.target.value)}
						className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
					/>
				</div>
			</div>

			{/* Buttons */}
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
						: intervention
						? "Mettre à jour"
						: "Créer"}
				</button>
			</div>
		</form>
	);
};

export default InterventionForm;

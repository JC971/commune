"use client";

import React, { useState, useRef, ChangeEvent } from "react";
import { Send, MapPin, Camera, Loader2 } from "lucide-react";

// Assume DoleanceCategory type is fetched or available
interface DoleanceCategory {
	id: number;
	name: string;
}

interface DoleanceFormProps {
	categories: DoleanceCategory[];
	onSubmit: (formData: FormData) => void; // Use FormData for file uploads
	isLoading: boolean;
	error: string | null;
	successMessage: string | null;
}

const DoleanceForm: React.FC<DoleanceFormProps> = ({
	categories,
	onSubmit,
	isLoading,
	error,
	successMessage,
}) => {
	const [description, setDescription] = useState("");
	const [categoryId, setCategoryId] = useState<number | string>("");
	const [address, setAddress] = useState("");
	const [latitude, setLatitude] = useState<number | null>(null);
	const [longitude, setLongitude] = useState<number | null>(null);
	const [isAnonymous, setIsAnonymous] = useState(false);
	const [submitterName, setSubmitterName] = useState("");
	const [submitterEmail, setSubmitterEmail] = useState("");
	const [files, setFiles] = useState<FileList | null>(null);
	const [isLocating, setIsLocating] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
		setFiles(e.target.files);
	};

	const handleLocateMe = () => {
		if (navigator.geolocation) {
			setIsLocating(true);
			navigator.geolocation.getCurrentPosition(
				(position) => {
					setLatitude(position.coords.latitude);
					setLongitude(position.coords.longitude);
					// Optionally try to reverse geocode to get an address
					// fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}`)
					//   .then(res => res.json())
					//   .then(data => setAddress(data.display_name || 'Localisation approximative obtenue'))
					//   .catch(err => console.error("Reverse geocoding failed:", err))
					//   .finally(() => setIsLocating(false));
					setAddress("Coordonnées GPS obtenues"); // Simple feedback
					setIsLocating(false);
				},
				(error) => {
					console.error("Geolocation error:", error);
					alert(
						"Impossible d'obtenir la localisation. Vérifiez les autorisations de votre navigateur."
					);
					setIsLocating(false);
				},
				{ enableHighAccuracy: true }
			);
		} else {
			alert("La géolocalisation n'est pas supportée par votre navigateur.");
		}
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		const formData = new FormData();
		formData.append("description", description);
		formData.append("doleance_category_id", categoryId.toString());
		formData.append("address", address);
		if (latitude !== null) formData.append("latitude", latitude.toString());
		if (longitude !== null) formData.append("longitude", longitude.toString());
		formData.append("is_anonymous", isAnonymous.toString());
		if (!isAnonymous) {
			formData.append("submitter_name", submitterName);
			formData.append("submitter_email", submitterEmail);
			// Add phone if collected
		}
		if (files) {
			for (let i = 0; i < files.length; i++) {
				formData.append("attachments", files[i]);
			}
		}
		onSubmit(formData);
	};

	return (
		<form
			onSubmit={handleSubmit}
			className="space-y-5 p-6 bg-white rounded-lg shadow border border-gray-200 max-w-2xl mx-auto"
		>
			<h2 className="text-xl font-semibold text-gray-800 text-center">
				Signaler un problème
			</h2>

			{error && (
				<p className="text-red-600 bg-red-100 p-3 rounded text-sm">
					Erreur: {error}
				</p>
			)}
			{successMessage && (
				<p className="text-green-700 bg-green-100 p-3 rounded text-sm">
					{successMessage}
				</p>
			)}

			<div>
				<label
					htmlFor="doleance-description"
					className="block text-sm font-medium text-gray-700"
				>
					Description du problème <span className="text-red-500">*</span>
				</label>
				<textarea
					id="doleance-description"
					rows={5}
					value={description}
					onChange={(e) => setDescription(e.target.value)}
					required
					placeholder="Décrivez le plus précisément possible le problème rencontré..."
					className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
				/>
			</div>

			<div>
				<label
					htmlFor="doleance-category"
					className="block text-sm font-medium text-gray-700"
				>
					Catégorie
				</label>
				<select
					id="doleance-category"
					value={categoryId}
					onChange={(e) =>
						setCategoryId(e.target.value ? parseInt(e.target.value) : "")
					}
					className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
				>
					<option value="">-- Sélectionner une catégorie --</option>
					{categories.map((cat) => (
						<option key={cat.id} value={cat.id}>
							{cat.name}
						</option>
					))}
				</select>
			</div>

			<div>
				<label
					htmlFor="doleance-address"
					className="block text-sm font-medium text-gray-700"
				>
					Localisation
				</label>
				<div className="flex items-center space-x-2 mt-1">
					<input
						type="text"
						id="doleance-address"
						value={address}
						onChange={(e) => setAddress(e.target.value)}
						placeholder="Adresse ou lieu précis"
						className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
					/>
					<button
						type="button"
						onClick={handleLocateMe}
						disabled={isLocating}
						title="Utiliser ma position actuelle"
						className="p-2 border border-gray-300 rounded-md text-gray-600 hover:bg-gray-100 disabled:opacity-50"
					>
						{isLocating ? (
							<Loader2 className="h-5 w-5 animate-spin" />
						) : (
							<MapPin className="h-5 w-5" />
						)}
					</button>
				</div>
				{latitude && longitude && (
					<p className="text-xs text-gray-500 mt-1">
						Coordonnées GPS: {latitude.toFixed(6)}, {longitude.toFixed(6)}
					</p>
				)}
			</div>

			<div>
				<label
					htmlFor="doleance-files"
					className="block text-sm font-medium text-gray-700"
				>
					Photos / Vidéos (Optionnel)
				</label>
				<div className="mt-1 flex items-center space-x-2">
					<input
						type="file"
						id="doleance-files"
						ref={fileInputRef}
						multiple
						accept="image/*,video/*" // Specify acceptable file types
						onChange={handleFileChange}
						className="hidden" // Hide default input
					/>
					<button
						type="button"
						onClick={() => fileInputRef.current?.click()}
						className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 flex items-center"
					>
						<Camera className="h-4 w-4 mr-2" />
						Choisir des fichiers
					</button>
					{files && files.length > 0 && (
						<span className="text-sm text-gray-600">
							{files.length} fichier(s) sélectionné(s)
						</span>
					)}
				</div>
				<p className="text-xs text-gray-500 mt-1">
					Vous pouvez joindre des photos ou courtes vidéos pour illustrer le
					problème.
				</p>
			</div>

			<div className="border-t pt-4">
				<div className="relative flex items-start">
					<div className="flex h-6 items-center">
						<input
							id="anonymous"
							name="anonymous"
							type="checkbox"
							checked={isAnonymous}
							onChange={(e) => setIsAnonymous(e.target.checked)}
							className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
						/>
					</div>
					<div className="ml-3 text-sm leading-6">
						<label htmlFor="anonymous" className="font-medium text-gray-900">
							Soumettre anonymement
						</label>
						<p className="text-gray-500">
							Si coché, vos informations personnelles ne seront pas
							enregistrées.
						</p>
					</div>
				</div>
			</div>

			{!isAnonymous && (
				<div className="space-y-4 border-t pt-4">
					<p className="text-sm font-medium text-gray-700">
						Vos informations (Optionnel, pour suivi)
					</p>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<label
								htmlFor="submitter-name"
								className="block text-xs text-gray-600"
							>
								Nom
							</label>
							<input
								type="text"
								id="submitter-name"
								value={submitterName}
								onChange={(e) => setSubmitterName(e.target.value)}
								className="mt-1 block w-full px-3 py-1.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
							/>
						</div>
						<div>
							<label
								htmlFor="submitter-email"
								className="block text-xs text-gray-600"
							>
								Email
							</label>
							<input
								type="email"
								id="submitter-email"
								value={submitterEmail}
								onChange={(e) => setSubmitterEmail(e.target.value)}
								className="mt-1 block w-full px-3 py-1.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
							/>
						</div>
					</div>
				</div>
			)}

			<div className="flex justify-end pt-4 border-t border-gray-200">
				<button
					type="submit"
					disabled={isLoading}
					className="inline-flex items-center justify-center px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
				>
					{isLoading ? (
						<Loader2 className="h-5 w-5 animate-spin mr-2" />
					) : (
						<Send className="h-5 w-5 mr-2" />
					)}
					{isLoading ? "Envoi en cours..." : "Envoyer le signalement"}
				</button>
			</div>
		</form>
	);
};

export default DoleanceForm;

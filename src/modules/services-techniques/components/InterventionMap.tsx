"use client"; // Leaflet requires client-side rendering

import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Intervention } from "./InterventionList"; // Reuse the type

// Fix for default Leaflet marker icon issue with webpack
// @ts-expect-error Leaflet's _getIconUrl is not typed in its TypeScript definitions
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
	iconRetinaUrl:
		"https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
	iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
	shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

interface InterventionMapProps {
	interventions: Intervention[]; // Accept multiple interventions for list view
	center?: [number, number]; // Optional center override
	zoom?: number; // Optional zoom override
	selectedInterventionId?: number | null; // Optional: ID of the intervention to focus on
}

// Component to handle map centering when selectedInterventionId changes
const MapFocusController: React.FC<{
	interventions: Intervention[];
	selectedId: number | null;
	defaultCenter: [number, number];
	defaultZoom: number;
}> = ({ interventions, selectedId, defaultCenter, defaultZoom }) => {
	const map = useMap();

	useEffect(() => {
		if (selectedId) {
			const selectedIntervention = interventions.find(
				(int) => int.id === selectedId
			);
			if (
				selectedIntervention &&
				selectedIntervention.latitude &&
				selectedIntervention.longitude
			) {
				map.flyTo(
					[selectedIntervention.latitude, selectedIntervention.longitude],
					15
				); // Zoom in closer
			} else {
				map.flyTo(defaultCenter, defaultZoom);
			}
		} else {
			// Optional: Recenter on default if selection is cleared
			// map.flyTo(defaultCenter, defaultZoom);
		}
	}, [selectedId, interventions, map, defaultCenter, defaultZoom]);

	return null;
};

const InterventionMap: React.FC<InterventionMapProps> = ({
	interventions,
	center = [46.603354, 1.888334], // Default center (approx. center of France)
	zoom = 6, // Default zoom
	selectedInterventionId = null,
}) => {
	// Filter interventions that have coordinates
	const interventionsWithCoords = interventions.filter(
		(int) => int.latitude != null && int.longitude != null
	);

	// Calculate bounds or use default center/zoom
	let mapCenter: [number, number] = center;
	let mapZoom = zoom;

	if (interventionsWithCoords.length === 1) {
		mapCenter = [
			interventionsWithCoords[0].latitude!,
			interventionsWithCoords[0].longitude!,
		];
		mapZoom = 14; // Zoom closer for single point
	} else if (interventionsWithCoords.length > 1 && !selectedInterventionId) {
		// Basic centering logic (could use bounds calculation for better fit)
		const avgLat =
			interventionsWithCoords.reduce((sum, int) => sum + int.latitude!, 0) /
			interventionsWithCoords.length;
		const avgLon =
			interventionsWithCoords.reduce((sum, int) => sum + int.longitude!, 0) /
			interventionsWithCoords.length;
		mapCenter = [avgLat, avgLon];
		// Keep default zoom or calculate based on bounds
	}

	return (
		<MapContainer
			center={mapCenter}
			zoom={mapZoom}
			scrollWheelZoom={true}
			style={{ height: "100%", width: "100%" }}
		>
			<TileLayer
				attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
				url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
			/>
			{interventionsWithCoords.map((intervention) => (
				<Marker
					key={intervention.id}
					position={[intervention.latitude!, intervention.longitude!]}
				>
					<Popup>
						<strong>{intervention.title}</strong>
						<br />
						{intervention.address}
						<br />
						Statut: {intervention.status}
						<br />
						{/* TODO: Add link to intervention detail page */}
						<a
							href={`/services-techniques/${intervention.id}`}
							className="text-blue-600 hover:underline"
						>
							Voir détails
						</a>
					</Popup>
				</Marker>
			))}
			<MapFocusController
				interventions={interventionsWithCoords}
				selectedId={selectedInterventionId}
				defaultCenter={mapCenter}
				defaultZoom={mapZoom}
			/>
		</MapContainer>
	);
};

export default InterventionMap;

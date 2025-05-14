import React from "react";

const Footer: React.FC = () => {
	return (
		<footer className="bg-gray-200 p-4 text-center text-sm text-gray-600 border-t border-gray-300">
			© {new Date().getFullYear()} Municipalité Exemplaire - Tous droits
			réservés.
			{/* Optional: Add links to privacy policy, terms of service, etc. */}
		</footer>
	);
};

export default Footer;

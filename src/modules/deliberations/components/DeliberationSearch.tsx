import React, { useState } from "react";
import { Search } from "lucide-react";

interface DeliberationSearchProps {
	onSearch: (searchTerm: string, filters: Record<string, string | number | boolean>) => void;
}

const DeliberationSearch: React.FC<DeliberationSearchProps> = ({
	onSearch,
}) => {
	const [searchTerm, setSearchTerm] = useState("");
	// TODO: Add state and inputs for other filters (date range, theme, status, etc.)

	const handleSearch = (e: React.FormEvent) => {
		e.preventDefault();
		// TODO: Collect filter values
		const filters = {};
		onSearch(searchTerm, filters);
	};

	return (
		<form
			onSubmit={handleSearch}
			className="mb-6 p-4 bg-gray-100 rounded-lg shadow"
		>
			<div className="flex flex-wrap items-end gap-4">
				{/* Search Term Input */}
				<div className="flex-grow">
					<label
						htmlFor="search-term"
						className="block text-sm font-medium text-gray-700 mb-1"
					>
						Rechercher (titre, résumé, code...)
					</label>
					<div className="relative">
						<input
							type="text"
							id="search-term"
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							placeholder="Entrez vos mots-clés..."
							className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
						/>
						<div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
							<Search className="h-5 w-5 text-gray-400" />
						</div>
					</div>
				</div>

				{/* TODO: Add Filter Inputs (Date Range, Theme Dropdown, Status Select) */}
				{/* Example Date Filter */}
				{/* <div className="flex-shrink-0">
          <label htmlFor="date-from" className="block text-sm font-medium text-gray-700 mb-1">Date début</label>
          <input type="date" id="date-from" className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
        </div>
        <div className="flex-shrink-0">
          <label htmlFor="date-to" className="block text-sm font-medium text-gray-700 mb-1">Date fin</label>
          <input type="date" id="date-to" className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
        </div> */}

				{/* Search Button */}
				<div className="flex-shrink-0">
					<button
						type="submit"
						className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
					>
						<Search className="h-5 w-5 mr-2" />
						Rechercher
					</button>
				</div>
			</div>
		</form>
	);
};

export default DeliberationSearch;

"use client"; // This context uses React hooks (useState, useContext)

import React, { createContext, useState, useContext, ReactNode } from "react";

// Define the shape of the user object and auth state
interface User {
	id: string;
	name: string;
	role: string; // Example: 'admin', 'elu', 'agent_technique', 'citoyen'
}

interface AuthState {
	user: User | null;
	isAuthenticated: boolean;
	login: (userData: User) => void;
	logout: () => void;
}

// Create the context with a default value
const AuthContext = createContext<AuthState | undefined>(undefined);

// Create the provider component
interface AuthProviderProps {
	children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
	const [user, setUser] = useState<User | null>(null);

	const login = (userData: User) => {
		setUser(userData);
		// TODO: Implement actual login logic (e.g., save token to localStorage)
	};

	const logout = () => {
		setUser(null);
		// TODO: Implement actual logout logic (e.g., remove token from localStorage)
	};

	const isAuthenticated = !!user;

	return (
		<AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
			{children}
		</AuthContext.Provider>
	);
};

// Create a custom hook to use the auth context
export const useAuth = (): AuthState => {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
};

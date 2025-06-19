import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import AuthStack from "./src/navigation/AuthStack";
import AppNavigator from "./src/navigation/AppNavigator";
import { AuthProvider, useAuth } from "./src/context/AuthContext";

function AppNavigation() {
	const { token } = useAuth();

	return (
		<NavigationContainer>
			{token ? <AppNavigator /> : <AuthStack />}
		</NavigationContainer>
	);
}

export default function App() {
	return (
		<AuthProvider>
			<AppNavigation />
		</AuthProvider>
	);
}

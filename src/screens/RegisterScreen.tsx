import React, { useState } from "react";
import { View, TextInput, Button, StyleSheet, Text, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function RegisterScreen({ navigation }: any) {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");

	const handleRegister = async () => {
		if (!email || !password) {
			Alert.alert("Error", "Please enter both fields");
			return;
		}

		// Save credentials
		await AsyncStorage.setItem(email, password);

		// ✅ Set mock token
		await AsyncStorage.setItem("token", "mock-jwt-token");

		Alert.alert("Success", "Registered successfully");

		// ✅ Navigate to main app stack
		navigation.replace("Login"); // or whatever your AppNavigator route is called
	};

	return (
		<View style={styles.container}>
			<Text style={styles.title}>Register</Text>
			<TextInput
				style={styles.input}
				placeholder="Email"
				value={email}
				onChangeText={setEmail}
				autoCapitalize="none"
			/>
			<TextInput
				style={styles.input}
				placeholder="Password"
				secureTextEntry
				value={password}
				onChangeText={setPassword}
			/>
			<Button title="Register" onPress={handleRegister} />
		</View>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, justifyContent: "center", padding: 20 },
	title: { fontSize: 24, marginBottom: 20, textAlign: "center" },
	input: { borderWidth: 1, padding: 10, marginBottom: 10, borderRadius: 5 },
});

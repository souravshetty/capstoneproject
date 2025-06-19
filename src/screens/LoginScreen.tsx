import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "../context/AuthContext";

export default function LoginScreen({ navigation }: any) {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const { login } = useAuth();

	const handleLogin = async () => {
		if (!email || !password) {
			Alert.alert("Error", "Please enter both fields");
			return;
		}

		const storedPassword = await AsyncStorage.getItem(email);

		if (storedPassword === null) {
			Alert.alert("Login failed", "User not found");
			return;
		}

		if (storedPassword === password) {
			await login("mock-jwt-token");
		} else {
			Alert.alert("Login failed", "Incorrect password");
		}
	};

	return (
		<View style={styles.container}>
			<Text style={styles.title}>Login</Text>
			<TextInput
				style={styles.input}
				placeholder="Email"
				onChangeText={setEmail}
				value={email}
				autoCapitalize="none"
			/>
			<TextInput
				style={styles.input}
				placeholder="Password"
				secureTextEntry
				onChangeText={setPassword}
				value={password}
			/>
			<Button title="Login" onPress={handleLogin} />
			<Text style={styles.link} onPress={() => navigation.navigate("Register")}>
				Don't have an account? Register
			</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, justifyContent: "center", padding: 20 },
	title: { fontSize: 24, marginBottom: 20, textAlign: "center" },
	input: { borderWidth: 1, padding: 10, marginBottom: 10, borderRadius: 5 },
	link: { color: "blue", marginTop: 15, textAlign: "center" },
});

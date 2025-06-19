import React, { useEffect, useState, useRef } from "react";
import { StyleSheet, View, Text, useWindowDimensions } from "react-native";
import {
	Camera,
	Face,
	FaceDetectionOptions,
} from "react-native-vision-camera-face-detector";
import {
	useCameraDevice,
	useCameraPermission,
} from "react-native-vision-camera";
import * as Speech from "expo-speech";

type Phase =
	| "start"
	| "movingLeft"
	| "holdingLeft"
	| "movingToCenterFromLeft"
	| "movingRight"
	| "holdingRight"
	| "movingToCenterFromRight";

export default function DetectionScreen() {
	const { hasPermission } = useCameraPermission();
	const { width, height } = useWindowDimensions();
	const device = useCameraDevice("front");

	const [phase, setPhase] = useState<Phase>("start");
	const [angleDelta, setAngleDelta] = useState<number>(0);
	const [arrow, setArrow] = useState<"left" | "right" | "center">("center");
	const [correctCount, setCorrectCount] = useState<number>(0);
	const [incorrectCount, setIncorrectCount] = useState<number>(0);
	const [feedbackMsg, setFeedbackMsg] = useState<string>("");

	const holdTimer = useRef<NodeJS.Timeout | null>(null);
	const lastSpoken = useRef<string>("");

	const speak = (message: string) => {
		if (lastSpoken.current !== message) {
			Speech.speak(message);
			lastSpoken.current = message;
		}
	};

	const resetHold = () => {
		if (holdTimer.current) clearTimeout(holdTimer.current);
		holdTimer.current = null;
	};

	const startHold = (onSuccess: () => void) => {
		resetHold();
		holdTimer.current = setTimeout(() => {
			onSuccess();
			resetHold();
		}, 3000);
	};

	const faceDetectionOptions: FaceDetectionOptions = {
		performanceMode: "accurate",
		landmarkMode: "all",
		contourMode: "none",
		classificationMode: "all",
		trackingEnabled: false,
		windowWidth: width,
		windowHeight: height,
		autoScale: true,
	};

	const handleFacesDetection = (faces: Face[]) => {
		try {
			if (faces?.length > 0) {
				const face = faces[0];

				const yaw = -(face.yawAngle ?? 0); // Flip for front camera
				const pitch = face.pitchAngle ?? 0;

				const pitchOk = pitch > -10 && pitch < 10; // face upright

				if (!pitchOk) {
					// FACE NOT UPRIGHT
					setArrow("center");
					setAngleDelta(999);
					setFeedbackMsg("Please keep your face upright");
					speak("Please keep your face upright");
					resetHold();
					return; // Block progress
				}

				// FACE UPRIGHT → normal flow
				setFeedbackMsg("");

				let targetYaw = 0;
				let targetPhase = phase;

				if (phase === "start" || phase === "movingLeft") {
					targetYaw = -30;
					setArrow("left");
					targetPhase = "movingLeft";
				} else if (
					phase === "movingToCenterFromLeft" ||
					phase === "movingRight"
				) {
					targetYaw = 30;
					setArrow("right");
					targetPhase = "movingRight";
				} else if (phase === "movingToCenterFromRight") {
					targetYaw = 0;
					setArrow("center");
				}

				const delta = Math.abs(yaw - targetYaw);
				setAngleDelta(delta);

				// --- PHASE LOGIC ---
				switch (phase) {
					case "start":
					case "movingLeft":
						if (yaw < -25) {
							setPhase("holdingLeft");
							speak("Hold this position");
							startHold(() => {
								setPhase("movingToCenterFromLeft");
								speak("Good, now return to center");
							});
						}
						break;

					case "movingToCenterFromLeft":
						if (yaw > -5 && yaw < 5) {
							setPhase("movingRight");
							speak("Now turn to the right");
						}
						break;

					case "movingRight":
						if (yaw > 25) {
							setPhase("holdingRight");
							speak("Hold this position");
							startHold(() => {
								setPhase("movingToCenterFromRight");
								speak("Good, now return to center");
							});
						}
						break;

					case "movingToCenterFromRight":
						if (yaw > -5 && yaw < 5) {
							setPhase("start");
							setCorrectCount((prev) => prev + 1);
							speak("Repetition complete. Well done!");
						}
						break;
				}

				// Incorrect movement
				if (
					(phase === "start" && yaw > 10) ||
					(phase === "movingRight" && yaw < -10)
				) {
					setIncorrectCount((prev) => prev + 1);
					speak("Incorrect, try again");
					setPhase("start");
					resetHold();
				}
			} else {
				// No face detected
				setAngleDelta(0);
				setArrow("center");
				setFeedbackMsg("No face detected");
			}
		} catch (error) {
			console.error("Error in face detection:", error);
		}
	};

	if (!hasPermission)
		return <Text>Camera permission is required to use this feature.</Text>;
	if (device == null) return <Text>Camera device not found.</Text>;

	const arrowSymbol = arrow === "left" ? "⬅️" : arrow === "right" ? "➡️" : "⬆️";

	const stepNumber =
		phase === "start" || phase === "movingLeft"
			? 1
			: phase === "holdingLeft"
			? 2
			: phase === "movingRight" || phase === "movingToCenterFromLeft"
			? 3
			: 4;

	return (
		<View style={StyleSheet.absoluteFill}>
			<Camera
				style={StyleSheet.absoluteFill}
				device={device}
				isActive={true}
				faceDetectionCallback={handleFacesDetection}
				faceDetectionOptions={faceDetectionOptions}
			/>
			<View style={styles.feedbackContainer}>
				<Text style={styles.feedbackHeading}>Neck Rotation Exercise</Text>
				<Text style={styles.stepText}>Step {stepNumber} of 4</Text>
				<Text style={styles.arrowText}>{arrowSymbol}</Text>
				<Text style={styles.feedbackText}>
					🎯 Angle delta: {angleDelta === 999 ? "--" : angleDelta.toFixed(1)}°
				</Text>
				{feedbackMsg !== "" && (
					<Text style={styles.feedbackError}>{feedbackMsg}</Text>
				)}
				<View style={styles.countContainer}>
					<Text style={styles.countText}>✔ Correct: {correctCount}</Text>
					<Text style={styles.countText}>❌ Incorrect: {incorrectCount}</Text>
				</View>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	feedbackContainer: {
		position: "absolute",
		bottom: 40,
		left: 20,
		right: 20,
		backgroundColor: "rgba(0,0,0,0.7)",
		borderRadius: 16,
		padding: 16,
		alignItems: "center",
	},
	feedbackHeading: {
		color: "#fff",
		fontSize: 20,
		fontWeight: "bold",
		marginBottom: 8,
	},
	stepText: {
		color: "#87CEEB",
		fontSize: 18,
		marginBottom: 4,
	},
	arrowText: {
		fontSize: 48,
		marginBottom: 8,
	},
	feedbackText: {
		color: "#90ee90",
		fontSize: 16,
		marginBottom: 10,
		textAlign: "center",
	},
	feedbackError: {
		color: "red",
		fontSize: 16,
		fontWeight: "bold",
		marginBottom: 10,
	},
	countContainer: {
		flexDirection: "row",
		justifyContent: "space-between",
		width: "100%",
		paddingHorizontal: 20,
	},
	countText: {
		color: "#fff",
		fontSize: 16,
		fontWeight: "600",
	},
});

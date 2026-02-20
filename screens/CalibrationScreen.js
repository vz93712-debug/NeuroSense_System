import React, { useRef, useState, useCallback } from "react";
import { StyleSheet, View, Text, Animated, PanResponder } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { Audio } from "expo-av";
import { theme } from "../theme";
import { AppContext } from "../AppContext";
import { useContext } from "react";

const TRACK_HEIGHT = 300;
const MIN_DB = 0;
const MAX_DB = 100;

export default function CalibrationScreen() {
  const { threshold, setThreshold } = useContext(AppContext);
  const initialY =
    TRACK_HEIGHT - ((threshold - MIN_DB) / (MAX_DB - MIN_DB)) * TRACK_HEIGHT;
  const [displayDb, setDisplayDb] = useState(threshold);
  const thresholdAnim = useRef(new Animated.Value(initialY)).current;
  const thresholdRef = useRef(initialY);
  const volumeAnim = useRef(new Animated.Value(0)).current;

  useFocusEffect(
    useCallback(() => {
      let recording = null;
      let isSubscribed = true;

      const startMonitoring = async () => {
        try {
          await Audio.requestPermissionsAsync();
          await Audio.setAudioModeAsync({
            allowsRecordingIOS: true,
            playsInSilentModeIOS: true,
          });

          const { recording: newRecording } = await Audio.Recording.createAsync(
            Audio.RecordingOptionsPresets.LOW_QUALITY,
            (status) => {
              if (status.isRecording && isSubscribed) {
                const rawDb = status.metering || -160;
                const normalizedDb = Math.min(
                  90,
                  Math.max(25, Math.round(85 + rawDb * 0.75)),
                );

                Animated.timing(volumeAnim, {
                  toValue: normalizedDb,
                  duration: 150,
                  useNativeDriver: false,
                }).start();
              }
            },
            150,
          );
          recording = newRecording;
        } catch (err) {}
      };

      startMonitoring();

      return () => {
        isSubscribed = false;
        if (recording) {
          recording.stopAndUnloadAsync().catch(() => {});
        }
      };
    }, []),
  );

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (evt, gestureState) => {
        let newY = thresholdRef.current + gestureState.dy;
        newY = Math.max(0, Math.min(TRACK_HEIGHT, newY));
        thresholdAnim.setValue(newY);
        let finalDb =
          Math.round(
            ((TRACK_HEIGHT - newY) / TRACK_HEIGHT) * (MAX_DB - MIN_DB),
          ) + MIN_DB;
        setThreshold(finalDb);
        let db =
          Math.round(
            ((TRACK_HEIGHT - newY) / TRACK_HEIGHT) * (MAX_DB - MIN_DB),
          ) + MIN_DB;
        setDisplayDb(db);
      },
      onPanResponderRelease: (evt, gestureState) => {
        let newY = thresholdRef.current + gestureState.dy;
        thresholdRef.current = Math.max(0, Math.min(TRACK_HEIGHT, newY));
      },
    }),
  ).current;

  const maskHeight = volumeAnim.interpolate({
    inputRange: [0, 100],
    outputRange: [TRACK_HEIGHT, 0],
    extrapolate: "clamp",
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>РЕЖИМ КАЛИБРОВКИ</Text>
      </View>

      <View style={styles.mainContent}>
        <View style={styles.meterWrapper}>
          <View style={styles.meterTrack}>
            <LinearGradient
              colors={["#FF3D00", "#FFD600", "#00E676"]}
              locations={[0.0, 0.4, 1.0]}
              style={StyleSheet.absoluteFill}
            />
            <Animated.View style={[styles.mask, { height: maskHeight }]} />
          </View>

          <Animated.View
            {...panResponder.panHandlers}
            style={[
              styles.sliderContainer,
              { transform: [{ translateY: thresholdAnim }] },
            ]}
          >
            <View style={styles.thresholdLine} />
            <View style={styles.thresholdHandle}>
              <View style={styles.triangle} />
              <Text style={styles.handleText}>{displayDb} дБ</Text>
            </View>
          </Animated.View>
        </View>
      </View>

      <View style={styles.instruction}>
        <Text style={styles.instructionText}>
          Установите линию порога выше уровня фонового шума.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0A0A0A" },
  header: { marginTop: 20, marginBottom: 20, alignItems: "center" },
  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 1.5,
    textTransform: "uppercase",
    color: theme.colors.textMain,
  },
  mainContent: { flex: 1, justifyContent: "center", alignItems: "center" },
  meterWrapper: { height: TRACK_HEIGHT, width: 60, position: "relative" },
  meterTrack: {
    width: 60,
    height: TRACK_HEIGHT,
    borderRadius: 30,
    backgroundColor: "#1C1C1E",
    overflow: "hidden",
  },
  mask: {
    position: "absolute",
    top: 0,
    width: "100%",
    backgroundColor: "#1C1C1E",
  },
  sliderContainer: {
    position: "absolute",
    top: -15,
    left: -20,
    right: -80,
    height: 30,
    flexDirection: "row",
    alignItems: "center",
    zIndex: 10,
  },
  thresholdLine: {
    width: 80,
    height: 2,
    backgroundColor: "#FFFFFF",
    shadowColor: theme.colors.primaryNeon,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 5,
  },
  thresholdHandle: {
    marginLeft: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: theme.colors.primaryNeon,
    backgroundColor: "#0A0A0A",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    position: "relative",
  },
  triangle: {
    position: "absolute",
    left: -7,
    top: "70%",
    transform: [{ translateY: -3 }],
    width: 0,
    height: 0,
    borderTopWidth: 5,
    borderTopColor: "transparent",
    borderBottomWidth: 5,
    borderBottomColor: "transparent",
    borderRightWidth: 5,
    borderRightColor: theme.colors.primaryNeon,
  },
  handleText: {
    color: theme.colors.primaryNeon,
    fontSize: 12,
    fontWeight: "700",
  },
  instruction: {
    marginBottom: 40,
    paddingHorizontal: 40,
    alignItems: "center",
  },
  instructionText: {
    color: theme.colors.textSec,
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
});

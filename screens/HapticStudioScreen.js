import React, { useState, useRef, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  Animated,
  Easing,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import { theme } from "../theme";

const Visualizer = ({ isRecording, metering }) => {
  const bars = [1, 2, 3, 4, 5].map(() => useRef(new Animated.Value(4)).current);

  useEffect(() => {
    if (isRecording) {
      const normalizedDb = Math.max(4, 40 + (metering || -160) * 0.5);
      bars.forEach((bar) => {
        const randomHeight = normalizedDb + (Math.random() * 10 - 5);
        Animated.timing(bar, {
          toValue: Math.max(4, randomHeight),
          duration: 100,
          useNativeDriver: false,
        }).start();
      });
    } else {
      bars.forEach((bar) =>
        Animated.timing(bar, {
          toValue: 4,
          duration: 200,
          useNativeDriver: false,
        }).start(),
      );
    }
  }, [metering, isRecording]);

  return (
    <View style={styles.visualizerContainer}>
      {bars.map((bar, index) => (
        <Animated.View
          key={index}
          style={[
            styles.visualizerBar,
            {
              height: bar,
              backgroundColor: isRecording
                ? theme.colors.alertOrange
                : theme.colors.textSec,
            },
          ]}
        />
      ))}
    </View>
  );
};

export default function HapticStudioScreen() {
  const [recording, setRecording] = useState(null);
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [metering, setMetering] = useState(-160);
  const [duration, setDuration] = useState(0);
  const isPreparing = useRef(false);

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  const startRecording = async () => {
    if (recording || isPreparing.current) return;

    isPreparing.current = true;

    try {
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status !== "granted") {
        Alert.alert("Ошибка", "Нужен доступ к микрофону для записи звука");
        isPreparing.current = false;
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      Animated.spring(scaleAnim, {
        toValue: 0.9,
        useNativeDriver: true,
      }).start();
      pulseAnim.setValue(0);
      Animated.loop(
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ).start();

      if (sound) {
        await sound.unloadAsync();
        setSound(null);
      }

      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY,
        (status) => {
          if (status.isRecording) {
            setMetering(status.metering);
            setDuration(status.durationMillis);
          }
        },
        100,
      );

      setRecording(newRecording);
    } catch (err) {
      console.error("Failed to start recording:", err);
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }).start();
    } finally {
      isPreparing.current = false;
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 4,
      useNativeDriver: true,
    }).start();
    pulseAnim.stopAnimation();

    const recToStop = recording;
    setRecording(null);

    try {
      await recToStop.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false });

      const uri = recToStop.getURI();
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: false },
        (status) => {
          if (status.didJustFinish) setIsPlaying(false);
        },
      );
      setSound(newSound);
    } catch (err) {
      console.error("Failed to stop recording:", err);
    }
  };

  const playPreview = async () => {
    if (sound) {
      setIsPlaying(true);
      await sound.replayAsync();
    }
  };

  const clearRecord = () => {
    if (sound) sound.unloadAsync();
    setSound(null);
    setDuration(0);
  };

  const saveAudioTrigger = () => {
    Alert.alert(
      "Успешно",
      "Звуковой сэмпл сохранен локально и готов к привязке.",
    );
  };

  const ringScale = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.8],
  });
  const ringOpacity = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 0],
  });

  const formatTime = (millis) => (millis / 1000).toFixed(1) + "с";

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>ЗАПИСЬ ТРИГГЕРА</Text>
      </View>

      <View style={styles.mainContent}>
        <View style={styles.statusBadge}>
          <View style={[styles.recordingDot, { opacity: recording ? 1 : 0 }]} />
          <Text style={styles.statusText}>
            {recording
              ? `ЗАПИСЬ: ${formatTime(duration)}`
              : sound
                ? `ГОТОВО (${formatTime(duration)})`
                : "ОЖИДАНИЕ"}
          </Text>
        </View>

        <View style={styles.recordContainer}>
          {recording && (
            <Animated.View
              style={[
                styles.pulseRing,
                { transform: [{ scale: ringScale }], opacity: ringOpacity },
              ]}
            />
          )}

          <Pressable onPressIn={startRecording} onPressOut={stopRecording}>
            <Animated.View
              style={[
                styles.btnRecord,
                {
                  transform: [{ scale: scaleAnim }],
                  borderColor: recording
                    ? theme.colors.alertOrange
                    : theme.colors.textSec,
                },
              ]}
            >
              <MaterialIcons
                name="mic"
                size={60}
                color={
                  recording ? theme.colors.alertOrange : theme.colors.textSec
                }
              />
            </Animated.View>
          </Pressable>
        </View>

        <Visualizer isRecording={!!recording} metering={metering} />
      </View>

      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.iconBtn, !sound && { opacity: 0.5 }]}
          onPress={clearRecord}
          disabled={!sound}
        >
          <MaterialIcons
            name="delete-outline"
            size={24}
            color={theme.colors.textSec}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.iconBtnPrimary, !sound && { opacity: 0.5 }]}
          onPress={playPreview}
          disabled={!sound || isPlaying}
        >
          <MaterialIcons
            name={isPlaying ? "volume-up" : "play-arrow"}
            size={32}
            color={theme.colors.bgDeep}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.iconBtnSave, !sound && { opacity: 0.5 }]}
          onPress={saveAudioTrigger}
          disabled={!sound}
        >
          <MaterialIcons
            name="check"
            size={28}
            color={theme.colors.primaryNeon}
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bgDeep,
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  header: { marginTop: 20, marginBottom: 20, alignItems: "center" },
  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 1.5,
    textTransform: "uppercase",
    color: theme.colors.textMain,
  },
  mainContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 50,
  },

  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: theme.colors.bgCardDash,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.alertOrange,
    shadowColor: theme.colors.alertOrange,
    elevation: 5,
  },
  statusText: {
    color: theme.colors.textSec,
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 1,
  },

  recordContainer: {
    width: 160,
    height: 160,
    justifyContent: "center",
    alignItems: "center",
  },
  btnRecord: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 2,
    backgroundColor: theme.colors.bgDeep,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  pulseRing: {
    position: "absolute",
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 2,
    borderColor: theme.colors.alertOrange,
  },

  visualizerContainer: {
    flexDirection: "row",
    gap: 6,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  visualizerBar: { width: 8, borderRadius: 4 },

  controls: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "auto",
    paddingHorizontal: 20,
  },
  iconBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: theme.colors.bgCardDash,
    justifyContent: "center",
    alignItems: "center",
  },
  iconBtnPrimary: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: theme.colors.textMain,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },
  iconBtnSave: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(0, 230, 118, 0.1)",
    borderWidth: 1,
    borderColor: theme.colors.primaryNeon,
    justifyContent: "center",
    alignItems: "center",
  },
});

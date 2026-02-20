import React, {
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { theme } from "../theme";
import { AppContext } from "../AppContext";
import { useFocusEffect } from "@react-navigation/native";
import { Audio } from "expo-av";

export default function DashboardScreen({ navigation }) {
  const { isMqttConnected, threshold, triggers, triggerAlarm, eventHistory } =
    useContext(AppContext);
  const [dbLevel, setDbLevel] = useState(45);

  const pulseAnim = useRef(new Animated.Value(0)).current;
  const lastTriggerTime = useRef(0);

  useFocusEffect(
    useCallback(() => {
      let recording = null;
      let isSubscribed = true;

      const startMonitoring = async () => {
        console.log("🎙 [START] Попытка запуска микрофона...");
        try {
          const perm = await Audio.requestPermissionsAsync();
          if (perm.status !== "granted") return;

          await Audio.setAudioModeAsync({
            allowsRecordingIOS: true,
            playsInSilentModeIOS: true,
            staysActiveInBackground: false,
            shouldDuckAndroid: true,
            playThroughEarpieceAndroid: false,
          });
          await new Promise((resolve) => setTimeout(resolve, 500));

          let dbHistory = [];

          const { recording: newRecording } = await Audio.Recording.createAsync(
            Audio.RecordingOptionsPresets.LOW_QUALITY,
            (status) => {
              if (status.isRecording && isSubscribed) {
                const rawDb = status.metering || -160;
                const normalizedDb = Math.min(
                  90,
                  Math.max(25, Math.round(85 + rawDb * 0.75)),
                );
                setDbLevel(normalizedDb);

                dbHistory.push(normalizedDb);
                if (dbHistory.length > 5) dbHistory.shift();

                if (normalizedDb >= threshold) {
                  const now = Date.now();
                  if (now - lastTriggerTime.current > 5000) {
                    lastTriggerTime.current = now;
                    const pastDb = dbHistory[0] || threshold;
                    const delta = normalizedDb - pastDb;
                    let detectedKey = null;

                    if (delta >= 20) detectedKey = "fireAlarm";
                    else if (normalizedDb > threshold + 15)
                      detectedKey = "babyCry";
                    else detectedKey = "doorbell";

                    const activeKeys = Object.keys(triggers).filter(
                      (key) => triggers[key].isActive,
                    );
                    if (activeKeys.includes(detectedKey)) {
                      triggerAlarm(detectedKey, triggers[detectedKey].hex);
                    } else if (activeKeys.length > 0) {
                      triggerAlarm(activeKeys[0], triggers[activeKeys[0]].hex);
                    }
                  }
                }
              }
            },
            200,
          );

          recording = newRecording;
          console.log("✅ Запись успешно стартовала!");
        } catch (err) {
          console.error("🚨 КРИТИЧЕСКАЯ ОШИБКА МИКРОФОНА:", err);
        }
      };

      startMonitoring();

      Animated.loop(
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
      ).start();

      return () => {
        isSubscribed = false;
        if (recording) {
          recording.stopAndUnloadAsync().catch(() => {});
        }
        pulseAnim.stopAnimation();
      };
    }, [threshold, triggers]),
  );

  const dynamicScale = 2.5 + (dbLevel / 100) * 1.5;
  const radarScale = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, dynamicScale],
  });
  const radarOpacity = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 0],
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>NeuroSense</Text>
        <View style={styles.systemStatus}>
          <View
            style={[
              styles.statusDot,
              {
                backgroundColor: isMqttConnected
                  ? theme.colors.primaryNeon
                  : theme.colors.red,
              },
            ]}
          />
          <Text
            style={[
              styles.statusText,
              {
                color: isMqttConnected
                  ? theme.colors.primaryNeon
                  : theme.colors.red,
              },
            ]}
          >
            {isMqttConnected ? "Система активна" : "Система не активна"}
          </Text>
        </View>
      </View>

      <View style={styles.mainDisplay}>
        <View style={styles.radarContainer}>
          <Animated.View
            style={[
              styles.radarRing,
              styles.ring1,
              { transform: [{ scale: radarScale }], opacity: radarOpacity },
            ]}
          />
          <View style={[styles.radarRing, styles.ring2]} />
          <View style={[styles.radarRing, styles.ring3]} />

          <View style={styles.dbValueContainer}>
            <Text style={styles.dbNumber}>{dbLevel}</Text>
            <Text style={styles.dbUnit}>dB Фон</Text>
          </View>
        </View>
      </View>

      <View style={styles.footerLog}>
        <Text style={styles.sectionTitle}>Последние события</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContainer}
        >
          {!eventHistory || eventHistory.length === 0 ? (
            <Text
              style={{
                color: theme.colors.textSec,
                fontSize: 12,
                marginTop: 20,
              }}
            >
              Событий пока нет. Пошумите в микрофон!
            </Text>
          ) : (
            eventHistory.slice(0, 3).map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.eventCard}
                activeOpacity={0.7}
                onPress={() => navigation.navigate("EventHistory")}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.iconBox}>
                    <MaterialIcons
                      name={item.icon}
                      size={22}
                      color={item.color}
                      style={{
                        textShadowColor: item.color,
                        textShadowRadius: 10,
                      }}
                    />
                  </View>
                  <Text style={styles.timeTag}>{item.time}</Text>
                </View>
                <View>
                  <Text style={styles.cardTitle}>{item.title}</Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.bgDeep },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    height: 60,
    marginTop: 10,
  },
  logo: { fontSize: 20, fontWeight: "700", color: theme.colors.textMain },
  systemStatus: { flexDirection: "row", alignItems: "center", gap: 8 },
  statusDot: { width: 6, height: 6, borderRadius: 3, elevation: 5 },
  statusText: { fontSize: 10, fontWeight: "600", letterSpacing: 1 },
  mainDisplay: { flex: 1, justifyContent: "center", alignItems: "center" },
  radarContainer: {
    width: 300,
    height: 300,
    justifyContent: "center",
    alignItems: "center",
  },
  radarRing: {
    position: "absolute",
    borderRadius: 150,
    borderWidth: 1,
    borderColor: "rgba(0, 230, 118, 0.3)",
  },
  ring1: { width: 100, height: 100 },
  ring2: { width: 200, height: 200, opacity: 0.4 },
  ring3: { width: 300, height: 300, opacity: 0.1 },
  dbValueContainer: { alignItems: "center", zIndex: 10 },
  dbNumber: { fontSize: 48, fontWeight: "700", color: theme.colors.textMain },
  dbUnit: {
    fontSize: 14,
    color: theme.colors.textSec,
    textTransform: "uppercase",
    letterSpacing: 2,
    marginTop: 4,
  },
  footerLog: { paddingBottom: 20 },
  sectionTitle: {
    fontSize: 12,
    color: theme.colors.textSec,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginLeft: 24,
    marginBottom: 16,
  },
  scrollContainer: { paddingHorizontal: 24, gap: 16 },
  eventCard: {
    width: 140,
    height: 140,
    backgroundColor: theme.colors.bgCardDash,
    borderRadius: theme.radius.card,
    padding: 16,
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.02)",
    marginRight: 16,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    justifyContent: "center",
    alignItems: "center",
  },
  timeTag: { fontSize: 11, color: theme.colors.textSec },
  cardTitle: { fontSize: 14, fontWeight: "600", color: theme.colors.textMain },
  cardDesc: { fontSize: 10, color: theme.colors.textSec, marginTop: 4 },
});

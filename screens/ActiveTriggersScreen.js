import React, { useContext } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Switch,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { theme } from "../theme";
import { AppContext } from "../AppContext";

const TriggerCard = ({ triggerKey, title, iconName }) => {
  const { triggers, setTriggers } = useContext(AppContext);
  const data = triggers[triggerKey];

  const palette = [
    theme.colors.red,
    theme.colors.green,
    theme.colors.blue,
    theme.colors.pink,
  ];

  const toggleActive = () => {
    setTriggers((prev) => ({
      ...prev,
      [triggerKey]: {
        ...prev[triggerKey],
        isActive: !prev[triggerKey].isActive,
      },
    }));
  };

  const changeColor = (index, hexColor) => {
    if (!data.isActive) return;
    setTriggers((prev) => ({
      ...prev,
      [triggerKey]: { ...prev[triggerKey], colorIndex: index, hex: hexColor },
    }));
  };

  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View style={styles.eventInfo}>
          <View style={styles.iconBox}>
            <MaterialIcons
              name={iconName}
              size={22}
              color={data.isActive ? data.hex : theme.colors.textSec}
            />
          </View>
          <Text
            style={[styles.eventName, !data.isActive && styles.textInactive]}
          >
            {title}
          </Text>
        </View>
        <Switch
          trackColor={{ false: "#333333", true: data.hex }}
          thumbColor="#ffffff"
          onValueChange={toggleActive}
          value={data.isActive}
        />
      </View>

      <View
        style={[styles.pickerSection, !data.isActive && styles.pickerInactive]}
      >
        <Text style={styles.pickerLabel}>Цвет сигнала</Text>
        <View style={styles.colorsRow}>
          {palette.map((color, index) => {
            const isSelected = data.colorIndex === index;
            return (
              <TouchableOpacity
                key={index}
                activeOpacity={0.8}
                onPress={() => changeColor(index, color)}
                style={[
                  styles.colorDot,
                  { backgroundColor: color },
                  isSelected && {
                    borderColor: "#fff",
                    transform: [{ scale: 1.1 }],
                    shadowColor: color,
                    elevation: 5,
                  },
                ]}
              />
            );
          })}
        </View>
      </View>
    </View>
  );
};

export default function ActiveTriggersScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Активные триггеры</Text>
      </View>
      <ScrollView
        contentContainerStyle={styles.configList}
        showsVerticalScrollIndicator={false}
      >
        <TriggerCard
          triggerKey="babyCry"
          title="Baby Cry"
          iconName="child-care"
        />
        <TriggerCard
          triggerKey="doorbell"
          title="Doorbell"
          iconName="doorbell"
        />
        <TriggerCard
          triggerKey="fireAlarm"
          title="Fire Alarm"
          iconName="local-fire-department"
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.bgDeep },
  header: { paddingHorizontal: 24, marginTop: 20, marginBottom: 24 },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: theme.colors.textMain,
  },
  configList: { paddingHorizontal: 24, paddingBottom: 40, gap: 16 },
  card: {
    backgroundColor: theme.colors.bgCardEdit,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: theme.radius.cardEdit,
    padding: 20,
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.05)",
  },
  eventInfo: { flexDirection: "row", alignItems: "center", gap: 12 },
  iconBox: {
    width: 40,
    height: 40,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  eventName: { fontSize: 16, fontWeight: "600", color: theme.colors.textMain },
  textInactive: { color: theme.colors.textSec },
  pickerSection: { gap: 10 },
  pickerInactive: { opacity: 0.5 },
  pickerLabel: {
    fontSize: 10,
    color: theme.colors.textSec,
    textTransform: "uppercase",
    fontWeight: "600",
  },
  colorsRow: { flexDirection: "row", gap: 12 },
  colorDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "transparent",
  },
});

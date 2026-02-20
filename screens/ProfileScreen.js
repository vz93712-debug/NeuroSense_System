import React from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { theme } from "../theme";
const MenuRow = ({
  icon,
  title,
  isLast,
  color = theme.colors.textMain,
  onPress,
}) => (
  <TouchableOpacity
    style={[styles.menuRow, !isLast && styles.borderBottom]}
    activeOpacity={0.7}
    onPress={onPress}
  >
    <View style={styles.menuRowLeft}>
      <View style={styles.iconContainer}>
        <MaterialIcons name={icon} size={22} color={color} />
      </View>
      <Text style={[styles.menuTitle, { color }]}>{title}</Text>
    </View>
    <MaterialIcons
      name="chevron-right"
      size={24}
      color={theme.colors.textSec}
    />
  </TouchableOpacity>
);

export default function ProfileScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>ПРОФИЛЬ</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.userCard}>
          <View style={styles.avatarPlaceholder}>
            <MaterialIcons
              name="person"
              size={40}
              color={theme.colors.textSec}
            />
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>Иван Разработчик</Text>
            <Text style={styles.userEmail}>ivan.dev@neurosense.app</Text>
          </View>
          <TouchableOpacity style={styles.editButton}>
            <MaterialIcons
              name="edit"
              size={20}
              color={theme.colors.primaryNeon}
            />
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionHeader}>ОСНОВНОЕ</Text>
        <View style={styles.menuGroup}>
          <MenuRow
            icon="history"
            title="История событий"
            onPress={() => navigation.navigate("EventHistory")}
          />
          <MenuRow icon="devices" title="Мои устройства" isLast />
        </View>

        <Text style={styles.sectionHeader}>ПРИЛОЖЕНИЕ</Text>
        <View style={styles.menuGroup}>
          <MenuRow icon="settings" title="Настройки" />
          <MenuRow icon="help-outline" title="Поддержка" />
          <MenuRow
            icon="description"
            title="Пользовательское соглашение"
            isLast
          />
        </View>

        <Text style={styles.sectionHeader}>СИСТЕМА</Text>
        <View style={styles.menuGroup}>
          <MenuRow
            icon="bug-report"
            title="Режим разработчика"
            color={theme.colors.alertOrange}
          />
          <MenuRow
            icon="logout"
            title="Выйти из аккаунта"
            color={theme.colors.textSec}
            isLast
          />
        </View>

        <Text style={styles.versionText}>NeuroSense v1.0.0 (Build 14)</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bgDeep,
  },
  header: {
    marginTop: 20,
    marginBottom: 10,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 1.5,
    textTransform: "uppercase",
    color: theme.colors.textMain,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },

  userCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.bgCardDash,
    padding: 20,
    borderRadius: theme.radius.card,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
    marginBottom: 30,
    marginTop: 10,
  },
  avatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#2A2A2C",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: "700",
    color: theme.colors.textMain,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 12,
    color: theme.colors.textSec,
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 230, 118, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },

  sectionHeader: {
    fontSize: 11,
    fontWeight: "600",
    color: theme.colors.textSec,
    letterSpacing: 1.2,
    marginBottom: 8,
    marginLeft: 12,
  },
  menuGroup: {
    backgroundColor: theme.colors.bgCardDash,
    borderRadius: theme.radius.card,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.02)",
    marginBottom: 24,
    overflow: "hidden",
  },
  menuRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: theme.colors.bgSurface,
  },
  borderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
  },
  menuRowLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.05)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  menuTitle: {
    fontSize: 15,
    fontWeight: "500",
  },

  versionText: {
    textAlign: "center",
    fontSize: 12,
    color: theme.colors.textSec,
    marginTop: 10,
    opacity: 0.5,
  },
});

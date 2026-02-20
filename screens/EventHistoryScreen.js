import React, { useContext } from "react";
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { theme } from "../theme";
import { AppContext } from "../AppContext";

export default function EventHistoryScreen({ navigation }) {
  const { eventHistory } = useContext(AppContext);

  const renderItem = ({ item }) => (
    <View style={styles.historyCard}>
      <View style={styles.cardLeft}>
        <View style={styles.iconBox}>
          <MaterialIcons
            name={item.icon}
            size={24}
            color={item.color}
            style={{ textShadowColor: item.color, textShadowRadius: 10 }}
          />
        </View>
        <Text style={styles.cardTitle}>{item.title}</Text>
      </View>
      <Text style={styles.timeTag}>{item.time}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <MaterialIcons
            name="arrow-back-ios"
            size={20}
            color={theme.colors.textMain}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>ИСТОРИЯ СОБЫТИЙ</Text>
        <View style={styles.spacer} />
      </View>

      {eventHistory.length === 0 ? (
        <View style={styles.emptyState}>
          <MaterialIcons
            name="history"
            size={48}
            color={theme.colors.textSec}
            style={{ opacity: 0.5, marginBottom: 16 }}
          />
          <Text style={styles.emptyText}>История пуста</Text>
        </View>
      ) : (
        <FlatList
          data={eventHistory}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.bgDeep },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 1.5,
    color: theme.colors.textMain,
  },
  spacer: { width: 40 },
  listContent: { paddingHorizontal: 24, paddingBottom: 40, gap: 12 },
  historyCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: theme.colors.bgCardDash,
    padding: 16,
    borderRadius: theme.radius.card,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  cardLeft: { flexDirection: "row", alignItems: "center", gap: 16 },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    justifyContent: "center",
    alignItems: "center",
  },
  cardTitle: { fontSize: 16, fontWeight: "600", color: theme.colors.textMain },
  timeTag: { fontSize: 12, color: theme.colors.textSec, fontWeight: "500" },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 100,
  },
  emptyText: { color: theme.colors.textSec, fontSize: 16, fontWeight: "500" },
});

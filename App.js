import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { MaterialIcons } from "@expo/vector-icons";
import { theme } from "./theme";

import { AppProvider } from "./AppContext";

import DashboardScreen from "./screens/DashboardScreen";
import ActiveTriggersScreen from "./screens/ActiveTriggersScreen";
import CalibrationScreen from "./screens/CalibrationScreen";
import HapticStudioScreen from "./screens/HapticStudioScreen";
import ProfileScreen from "./screens/ProfileScreen";
import EventHistoryScreen from "./screens/EventHistoryScreen";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.colors.bgDeep,
          borderTopColor: "rgba(255,255,255,0.05)",
          borderTopWidth: 1,
          height: 85,
          paddingTop: 10,
          paddingBottom: 25,
        },
        tabBarActiveTintColor: theme.colors.primaryNeon,
        tabBarInactiveTintColor: theme.colors.textSec,
        tabBarShowLabel: false,
        tabBarIcon: ({ focused, color }) => {
          let iconName;
          if (route.name === "Dashboard") iconName = "radar";
          else if (route.name === "Triggers") iconName = "toggle-on";
          else if (route.name === "Calibration") iconName = "tune";
          else if (route.name === "Haptics") iconName = "vibration";
          else if (route.name === "Profile") iconName = "person";

          return (
            <MaterialIcons
              name={iconName}
              size={28}
              color={color}
              style={{
                textShadowColor: focused
                  ? theme.colors.primaryNeon
                  : "transparent",
                textShadowOffset: { width: 0, height: 0 },
                textShadowRadius: focused ? 10 : 0,
              }}
            />
          );
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Triggers" component={ActiveTriggersScreen} />
      <Tab.Screen name="Calibration" component={CalibrationScreen} />
      <Tab.Screen name="Haptics" component={HapticStudioScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <AppProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {/* Главное меню с табами */}
          <Stack.Screen name="MainTabs" component={TabNavigator} />
          {/* Экраны, которые открываются ПОВЕРХ табов */}
          <Stack.Screen name="EventHistory" component={EventHistoryScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </AppProvider>
  );
}

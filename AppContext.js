import React, { createContext, useState, useEffect, useRef } from "react";
import Paho from "paho-mqtt";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { theme } from "./theme";

export const AppContext = createContext();

const clientId = "neurosense_app_" + Math.random().toString(16).substr(2, 8);

export const AppProvider = ({ children }) => {
  const [triggers, setTriggers] = useState({
    babyCry: { isActive: true, colorIndex: 3, hex: theme.colors.pink },
    doorbell: { isActive: true, colorIndex: 2, hex: theme.colors.blue },
    fireAlarm: { isActive: false, colorIndex: 0, hex: theme.colors.red },
  });

  const [hapticPattern, setHapticPattern] = useState([]);
  const [isMqttConnected, setIsMqttConnected] = useState(false);
  const [threshold, setThreshold] = useState(45);
  const [eventHistory, setEventHistory] = useState([]);
  const mqttClient = useRef(null);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const savedHistory = await AsyncStorage.getItem("@event_history");
        if (savedHistory) setEventHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error(e);
      }
    };
    loadHistory();

    mqttClient.current = new Paho.Client("broker.hivemq.com", 8000, clientId);

    mqttClient.current.onConnectionLost = (responseObject) => {
      if (responseObject.errorCode !== 0) {
        console.log("MQTT Connection Lost:", responseObject.errorMessage);
        setIsMqttConnected(false);
      }
    };

    const options = {
      timeout: 3,
      onSuccess: () => {
        console.log("MQTT Connected Successfully!");
        setIsMqttConnected(true);
      },
      onFailure: (err) => {
        console.log("MQTT Connection Failed:", err.errorMessage);
        setIsMqttConnected(false);
      },
    };

    mqttClient.current.connect(options);

    return () => {
      if (mqttClient.current && mqttClient.current.isConnected()) {
        mqttClient.current.disconnect();
      }
    };
  }, []);

  const triggerAlarm = async (eventName, hexColor) => {
    if (mqttClient.current && mqttClient.current.isConnected()) {
      const payload = {
        event: eventName,
        color: hexColor,
        haptic_pattern:
          hapticPattern.length > 0
            ? hapticPattern
            : [{ type: "dot", duration: 200 }],
        timestamp: Date.now(),
      };

      const message = new Paho.Message(JSON.stringify(payload));
      message.destinationName = "neurosense/demo/cmd";
      mqttClient.current.send(message);

      console.log(`Sent to MQTT: ${eventName}`);
    } else {
      console.log("Cannot send: MQTT offline");
    }

    let title = "Событие";
    let icon = "notifications";

    if (eventName === "doorbell") {
      title = "Дверной звонок";
      icon = "doorbell";
    } else if (eventName === "babyCry") {
      title = "Плач ребенка";
      icon = "child-care";
    } else if (eventName === "fireAlarm") {
      title = "Пожарная тревога";
      icon = "local-fire-department";
    }

    const newEvent = {
      id: Date.now().toString(),
      title,
      icon,
      color: hexColor,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setEventHistory((prev) => {
      const updatedHistory = [newEvent, ...prev].slice(0, 50);
      AsyncStorage.setItem(
        "@event_history",
        JSON.stringify(updatedHistory),
      ).catch((e) => console.error(e));
      return updatedHistory;
    });
  };

  return (
    <AppContext.Provider
      value={{
        triggers,
        setTriggers,
        hapticPattern,
        setHapticPattern,
        isMqttConnected,
        triggerAlarm,
        threshold,
        setThreshold,
        eventHistory,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

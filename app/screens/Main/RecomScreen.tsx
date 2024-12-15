import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { getAuth } from "firebase/auth";
import { FireStoreDB } from "../Auth/FirebaseAuth";
import {
  getDoc,
  collection,
  query,
  where,
  getDocs,
  doc,
} from "firebase/firestore";
import { MaterialIcons } from "@expo/vector-icons";
import { Card, ProgressBar } from "react-native-paper";
import axios from "axios";

const API_KEY_WEATHER = "f41364f7b07c8996fd4434f1966cd65a";
const API_KEY_GEOCODER = "1139928607804365b08b9df36dd8a4ab";
const API_URL =
  "https://api.thingspeak.com/channels/2785871/fields/1.json?api_key=K16KR8XIHXGTTOE1&results=2E&sclient=gws-wiz-serp";

const RecommendationsScreen = () => {
  const [devices, setDevices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState<string | null>(null);
  const [weatherData, setWeatherData] = useState({});
  const [thingSpeakData, setThingSpeakData] = useState(null);
  const [moisture, setMoisture] = useState("");
  const [final, setFinal] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const auth = getAuth();
  const user = auth.currentUser;

  const fetchWeatherAndCity = async (
    latitude: number,
    longitude: number,
    deviceId: string
  ) => {
    try {
      const weatherResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&APPID=${API_KEY_WEATHER}&units=metric`
      );
      const weatherData = await weatherResponse.json();

      if (!weatherResponse.ok) {
        throw new Error(weatherData.message || "Failed to fetch weather data");
      }

      const temperature = `${weatherData.main.temp}°C`;
      const description = weatherData.weather[0].description;

      const cityResponse = await fetch(
        `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${API_KEY_GEOCODER}`
      );
      const cityData = await cityResponse.json();

      if (!cityResponse.ok) {
        throw new Error(cityData.status.message || "Failed to fetch city name");
      }

      const city =
        cityData.results[0].components.city ||
        cityData.results[0].components.town ||
        cityData.results[0].components.village ||
        "Unknown Location";

      setWeatherData((prevWeatherData) => ({
        ...prevWeatherData,
        [deviceId]: { temperature, description, city },
      }));
    } catch (error) {
      console.error("Error fetching weather and city:", error.message);
    }
  };

  const fetchDevices = async () => {
    try {
      if (user) {
        const userDocRef = doc(FireStoreDB, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          const userUsername = userData.username || user.email;
          setUsername(userUsername);

          const devicesQuery = query(
            collection(FireStoreDB, "devices"),
            where("userName", "==", userUsername)
          );
          const devicesSnapshot = await getDocs(devicesQuery);

          const devicesList = devicesSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setDevices(devicesList);

          devicesList.forEach((device) => {
            fetchWeatherAndCity(device.latitude, device.longitude, device.id);
          });
        } else {
          console.log("No user profile found");
        }
      }
    } catch (error) {
      console.error("Error fetching devices:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchThingSpeakData = async () => {
    try {
      const response = await axios.get(API_URL);
      setThingSpeakData(response.data);
      setMoisture(response.data);
    } catch (error) {
      console.error("Error fetching ThingSpeak data:", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
    fetchThingSpeakData();
  }, [user]);

  useEffect(() => {
    if (moisture && moisture.feeds) {
      moisture.feeds.forEach((feed, index) => {
        console.log(`Feed ${index + 1} - field1: ${feed.field1}`);
      });

      if (moisture.feeds.length > 0) {
        setFinal(moisture.feeds[1].field1);
      }
    }
  }, [moisture]);

  const moisturePercentage = final ? parseInt(final) / 100 : 0;

  const getRecommendation = (moisturePercentage: number, weatherDescription: string) => {
    if (weatherDescription.includes("rain") || weatherDescription.includes("shower")) {
      return "It’s raining! Postpone irrigation for now.";
    }

    if (moisturePercentage < 0.3) {
      return "Soil moisture is low. Irrigation is needed.";
    }

    if (moisturePercentage >= 0.3 && moisturePercentage <= 0.6) {
      return "Soil moisture is moderate. Irrigation might be needed soon.";
    }

    if (moisturePercentage > 0.6) {
      return "Soil moisture is sufficient. No need for irrigation at the moment.";
    }

    return "Monitor the weather and soil moisture regularly for optimal irrigation.";
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDevices(); // Refresh devices and weather data
    await fetchThingSpeakData(); // Refresh ThingSpeak data
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {loading ? (
          <ActivityIndicator
            size="large"
            color="blue"
            style={styles.loadingIndicator}
          />
        ) : devices.length > 0 ? (
          devices.map((device, index) => {
            const weather = weatherData[device.id] || {};
            const recommendation = getRecommendation(
              moisturePercentage,
              weather.description || ""
            );
            return (
              <View key={index} style={styles.deviceCard}>
                <Text style={styles.deviceName}>{device.name}</Text>

                <View style={styles.avatarContainer}>
                  <View style={styles.avatar}>
                    <MaterialIcons
                      name="devices"
                      size={30}
                      color="white"
                      style={styles.deviceIcon}
                    />
                  </View>
                  <View style={styles.deviceDetails}>
                    <Text style={styles.deviceUser}>
                      <MaterialIcons name="person" size={20} color="black" />{" "}
                      {username}
                    </Text>
                    <Text style={styles.deviceNumber}>
                      <MaterialIcons name="vpn-key" size={20} color="black" />{" "}
                      Device Number: {device.number}
                    </Text>
                    <Text style={styles.deviceCity}>
                      <MaterialIcons
                        name="location-city"
                        size={16}
                        color="black"
                      />{" "}
                      City: {weather.city || "Fetching..."}
                    </Text>
                    <Text style={styles.deviceWeather}>
                      Weather: {weather.temperature || "Fetching..."} -{" "}
                      {weather.description || ""}
                    </Text>
                    <Text style={styles.moistureText}>
                      Soil Moisture: {final}%
                    </Text>
                    <ProgressBar
                      progress={moisturePercentage}
                      color="green"
                      style={styles.progressBar}
                    />
                    <View>
  <Card style={styles.recommendationCard}>
    <Card.Content>
      <Text style={styles.rec}>
        Recommendation:
      </Text>
      <Text style={styles.recommendationText}>
        {recommendation}
      </Text>
    </Card.Content>
  </Card>
</View>
                  </View>
                </View>
              </View>
            );
          })
        ) : (
          <Text>No devices found. Please add a device.</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: "white",
    
  },
  scrollContainer: {
    paddingBottom: 30,
  },
  deviceCard: {
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    marginBottom: 15,
    padding: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation:10,
    marginTop:10
  },
  deviceName: {
    fontSize: 25,
    fontWeight: "bold",
    marginBottom: 10,
  },
  avatarContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    backgroundColor: "#2196F3",
    borderRadius: 50,
    padding: 10,
    marginRight: 10,
  },
  deviceIcon: {
    alignSelf: "center",
  },
  deviceDetails: {
    flex: 1,
  },
  deviceUser: {
    fontSize: 20,
    marginBottom: 4,
  },
  deviceNumber: {
    fontSize: 20,
    marginBottom: 4,
  },
  rec:{
    fontWeight:"bold",
    fontSize:15
  },
  deviceCity: {
    fontSize: 20,
    marginBottom: 4,
  },
  deviceWeather: {
    fontSize: 20,
    marginBottom: 8,
  },
  moistureText: {
    fontSize: 17,
    marginBottom: 8,
  },
  progressBar: {
    height:15,
    borderRadius:10,
    marginBottom: 8,
  },
 
  loadingIndicator: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  recommendationCard: {
    marginVertical: 10,
    padding: 15,
    backgroundColor: "#f9f9f9", // Change to desired background color
    borderRadius: 8,
    elevation: 3, // Optional, for shadow effect
  },
  recommendationText: {
    fontSize: 25,
    color: "black",
    fontWeight: "bold", // Adjust font styles as needed
  },
});

export default RecommendationsScreen;

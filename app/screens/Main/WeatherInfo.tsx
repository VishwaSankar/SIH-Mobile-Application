import { SafeAreaView, ScrollView } from "react-native";
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Location from "expo-location";

const API_KEY_WEATHER = "f41364f7b07c8996fd4434f1966cd65a";
const API_KEY_GEOCODER = "1139928607804365b08b9df36dd8a4ab";

export const weatherConditions = {
  Rain: {
    color: "#005BEA",
    title: "Raining",
    subtitle: "Get a cup of coffee",
    icon: "weather-rainy",
  },
  Clear: {
    day: {
      color: "#f7b733",
      icon: "weather-sunny",
      title: "So Sunny",
      subtitle: "It is hurting my eyes",
    },
    night: {
      color: "#2C3E50",
      icon: "weather-night",
      title: "Clear Night",
      subtitle: "Look at the stars!",
    },
  },
  Thunderstorm: {
    color: "#616161",
    title: "A Storm is coming",
    subtitle: "Because Gods are angry",
    icon: "weather-lightning",
  },
  Clouds: {
    color: "#1F1C2C",
    title: "Clouds",
    subtitle: "Everywhere",
    icon: "weather-cloudy",
  },
  Snow: {
    color: "#00d2ff",
    title: "Snow",
    subtitle: "Get out and build a snowman for me",
    icon: "weather-snowy",
  },
  Drizzle: {
    color: "#076585",
    title: "Drizzle",
    subtitle: "Partially raining...",
    icon: "weather-hail",
  },
  Haze: {
    color: "#66A6FF",
    title: "Haze",
    subtitle: "Another name for Partial Raining",
    icon: "weather-hail",
  },
  Mist: {
    color: "#3CD3AD",
    title: "Mist",
    subtitle: "Don't roam in forests!",
    icon: "weather-fog",
  },
};               

const WeatherScreen = () => {
  const [loading, setLoading] = useState(true);
  const [weatherData, setWeatherData] = useState(null);
  const [cityName, setCityName] = useState("Unknown Location");
  const [error, setError] = useState(null);

  const fetchWeatherAndCity = async (latitude, longitude) => {
    try {
      // Fetch weather data
      const weatherResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&APPID=${API_KEY_WEATHER}&units=metric`
      );
      const weatherData = await weatherResponse.json();

      if (!weatherResponse.ok) {
        throw new Error(weatherData.message || "Failed to fetch weather data");
      }

      const condition = weatherData.weather[0].main;
      const hour = new Date().getHours();
      const isNight = hour < 6 || hour >= 18;

      const weather =
        condition === "Clear"
          ? isNight
            ? weatherConditions["Clear"].night
            : weatherConditions["Clear"].day
            //@ts-ignore
          : weatherConditions[condition] || weatherConditions["Clear"];

      setWeatherData({
        temperature: `${weatherData.main.temp}°C`,
        description: weatherData.weather[0].description,
        condition: condition,
        ...weather,
      });

      // Fetch city name
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

      setCityName(city);
      setLoading(false);
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };


  //fetch city 
  useEffect(() => {
    const requestLocationPermission = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setError("Permission to access location was denied");
          setLoading(false);
          return;
        }

        const currentLocation = await Location.getCurrentPositionAsync({});
        fetchWeatherAndCity(
          currentLocation.coords.latitude,
          currentLocation.coords.longitude
        );
      } catch (error) {
        setError("An error occurred while fetching location");
        setLoading(false);
      }
    };

    requestLocationPermission();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {loading ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Error: {error}</Text>
          </View>
        ) : (
          <View
            style={[
              styles.weatherContainer,
              { backgroundColor: weatherData.color },
            ]}
          >
            <View style={styles.headerContainer}>
              <MaterialCommunityIcons
                size={72}
                name={weatherData.icon}
                color={"#fff"}
              />
              <Text style={styles.tempText}>{weatherData.temperature}</Text>
            </View>
            <View style={styles.bodyContainer}>
              <Text style={styles.cityText}>{cityName}</Text>
              <Text style={styles.title}>{weatherData.title}</Text>
              <Text style={styles.subtitle}>{weatherData.subtitle}</Text>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  weatherContainer: {
    flex: 1,
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  headerContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  tempText: {
    fontSize: 48,
    color: "#fff",
    fontWeight: "bold",
  },
  bodyContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  cityText: {
    fontSize: 20,
    color: "#fff",
    textAlign: "center",
    marginBottom: 10,
  },
  title: {
    fontSize: 36,
    color: "#fff",
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 18,
    color: "#fff",
    textAlign: "center",
    marginTop: 10,
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },
  errorText: {
    fontSize: 18,
    color: "red",
    textAlign: "center",
  },
});

export default WeatherScreen;

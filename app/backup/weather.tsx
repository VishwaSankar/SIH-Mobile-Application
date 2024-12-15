import { SafeAreaView, ScrollView } from "react-native";
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const API_KEY = "f41364f7b07c8996fd4434f1966cd65a"; 

const WeatherScreen = () => {
  const [loading, setLoading] = useState(true);
  const [weatherData, setWeatherData] = useState(null);
  const [error, setError] = useState(null);

  const fetchWeather = async (lat:any, lon:any) => {
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&APPID=${API_KEY}&units=metric`
      );
      const data = await response.json();
      if (response.ok) {
        setWeatherData({
          temperature: `${data.main.temp}°C`,
          condition: data.weather[0].main,
          description: data.weather[0].description,
          icon: `weather-${data.weather[0].main.toLowerCase()}`, // Maps to MaterialCommunityIcons names
          backgroundColor: "#f7b733", // You can dynamically set this based on weather condition
        });
        setLoading(false);
      } else {
        throw new Error(data.message || "Failed to fetch weather data");
      }
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    const latitude = 23.259933; 
    const longitude = 77.412613; 
    fetchWeather(latitude, longitude);
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
          <>
            <View>
              <Text style={styles.text}>Live Weather Forecast</Text>
            </View>
            <View
              style={[
                styles.weatherContainer,
                { backgroundColor: weatherData.backgroundColor },
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
                <Text style={styles.title}>{weatherData.condition}</Text>
                <Text style={styles.subtitle}>{weatherData.description}</Text>
              </View>
            </View>
          </>
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
  text: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 20,
  },
  weatherContainer: {
    flex: 1,
    borderRadius: 20,
    margin: 10,
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

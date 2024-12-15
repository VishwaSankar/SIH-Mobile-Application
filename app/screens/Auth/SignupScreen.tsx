import React, { useState } from "react";
import {
  ActivityIndicator,
  Button,
  KeyboardAvoidingView,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { FireBaseAuth, FireStoreDB } from "./FirebaseAuth";
import { doc, setDoc } from "firebase/firestore";

const API_KEY = "f41364f7b07c8996fd4434f1966cd65a";

const SignupScreen = ({ navigation }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [number, setNumber] = useState("");
  const [city, setCity] = useState("");
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [errorMsg, setErrorMsg] = useState(null);

  const validateForm = () => {
    let errors = {};
    if (!name) errors.name = "Name is required";
    if (!email) errors.email = "Email is required";
    if (!password) errors.password = "Password is required";
    if (!number) errors.number = "Mobile number is required";
    if (!city) errors.city = "City is required";

    setErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const fetchLatLon = async (cityName) => {
    try {
      const response = await fetch(
        `http://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`
      );
      const data = await response.json();
      if (data && data.length > 0) {
        return {
          latitude: data[0].lat,
          longitude: data[0].lon,
        };
      } else {
        throw new Error("City not found");
      }
    } catch (error) {
      console.error("Error fetching location", error.message);
      throw new Error("Unable to fetch latitude and longitude for the city");
    }
  };

  const signup = async () => {
    if (!validateForm()) return;
  
    setLoading(true);
    try {
      // Fetch latitude and longitude for the entered city
      const coords = await fetchLatLon(city);
  
      // Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(
        FireBaseAuth,
        email,
        password
      );
      const userId = userCredential.user.uid; // Unique user ID from Firebase Auth
  
      // Save user data to Firestore, including location and city name
      await setDoc(doc(FireStoreDB, "users", userId), {
        username: name,
        email: email,
        phone: number,
        city: city, // Store city name
        location: {
          cityName: city, // Explicitly store the city name again for clarity
          latitude: coords.latitude,
          longitude: coords.longitude,
        },
      });
  
      alert("Account created successfully! Check your email for verification.");
      setName("");
      setEmail("");
      setPassword("");
      setNumber("");
      setCity("");
      setErrors({});
      navigation.navigate("Login"); // Navigate to Login Screen
    } catch (error) {
      console.error("Signup failed", error.message);
      alert("Signup failed: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.form}>
          <Text style={styles.text}>Signup</Text>
          <KeyboardAvoidingView behavior="padding">
            <Text style={styles.label}>Name:</Text>
            <TextInput
              style={styles.input}
              placeholder="Name"
              value={name}
              onChangeText={setName}
            />
            {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}

            <Text style={styles.label}>Email:</Text>
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
            />
            {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

            <Text style={styles.label}>Password:</Text>
            <TextInput
              style={styles.input}
              placeholder="Password"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
            {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

            <Text style={styles.label}>Mobile Number:</Text>
            <TextInput
              style={styles.input}
              placeholder="Mobile Number"
              value={number}
              onChangeText={setNumber}
              keyboardType="phone-pad"
            />
            {errors.number && <Text style={styles.errorText}>{errors.number}</Text>}

            <Text style={styles.label}>City:</Text>
            <TextInput
              style={styles.input}
              placeholder="City"
              value={city}
              onChangeText={setCity}
            />
            {errors.city && <Text style={styles.errorText}>{errors.city}</Text>}

            {loading ? (
              <ActivityIndicator size="large" color="blue" />
            ) : (
              <Button title="Signup" onPress={signup} />
            )}

            <Text
              style={styles.linkText}
              onPress={() => navigation.navigate("Login")}
            >
              Already have an account? Login here.
            </Text>
          </KeyboardAvoidingView>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  form: {
    width: "90%",
    backgroundColor: "white",
    padding: 20,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "black",
    elevation: 5,
  },
  text: {
    fontSize: 24,
    textAlign: "center",
    fontWeight: "bold",
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    marginBottom: 5,
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderColor: "black",
    marginBottom: 10,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  errorText: {
    color: "red",
    fontSize: 12,
  },
  linkText: {
    marginTop: 20,
    textAlign: "center",
    color: "blue",
    textDecorationLine: "underline",
  },
});

export default SignupScreen;

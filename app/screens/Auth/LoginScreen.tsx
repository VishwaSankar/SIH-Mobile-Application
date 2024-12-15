import React, { useState } from "react";
import {
  ActivityIndicator,
  Button,
  KeyboardAvoidingView,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { FireBaseApp } from "./FirebaseAuth";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

const LoginScreen = ({ navigation }) => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [number, setNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const auth = getAuth(FireBaseApp);

  // Update the error state to include email
  const [errors, setErrors] = useState<{
    username?: string;
    email?: string; // Add email to errors
    password?: string;
    number?: string;
  }>({});

  const validateForm = () => {
    let errors: { username?: string; email?: string; password?: string; number?: string } = {};
    if (!username) errors.username = "Username is required";
    if (!email) errors.email = "Email is required"; // Validate email
    if (!password) errors.password = "Password is required";
    if (!number) errors.number = "Mobile Number is required";

    setErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const Login = async () => {
    if (validateForm()) {
      console.log("Submitted", username, password);
      setUsername("");
      setPassword("");
      setErrors({});
    }
    setLoading(true);
    try {
      const response = await signInWithEmailAndPassword(auth, email, password);
      console.log(response);
      alert("Logged in Successfully");
    } catch (error: any) {
      console.log(error);
      console.log("Signup failure: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.form}>
          <Text style={styles.text}>Login</Text>
          <KeyboardAvoidingView behavior="padding">
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
            {loading ? (
              <ActivityIndicator size="large" color="blue" />
            ) : (
              <>
                <Button title="Login" onPress={Login} />
              </>
            )}
            <Text style={{ textAlign: "center", paddingTop: 10 }}>
              Don't you have an account?
            </Text>
            <Pressable
              onPress={() => {
                navigation.navigate("Signup");
              }}
            >
              <Text
                style={{
                  textAlign: "center",
                  paddingTop: 5,
                  fontSize: 10,
                  color: "blue",
                  textDecorationLine: "underline",
                }}
              >
                Click me to Signup
              </Text>
            </Pressable>
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
    justifyContent: "center",
    alignItems: "center",
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
    borderWidth: 1,
    borderRadius: 20,
    borderColor: "black",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
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
    fontWeight: "bold",
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
    marginBottom: 10,
  },
});

export default LoginScreen;

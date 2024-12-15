import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  Button,
  Alert,
} from "react-native";
import { onAuthStateChanged, User } from "firebase/auth";
import { FireBaseAuth, FireStoreDB } from "../Auth/FirebaseAuth";
import { doc, getDoc } from "firebase/firestore";

const ProfileScreen = () => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState(null); // For Firestore data
  const [loading, setLoading] = useState(true);

  // Monitor the authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      FireBaseAuth,
      async (currentUser) => {
        setUser(currentUser);
        if (currentUser) {
          await fetchUserData(currentUser.uid); // Fetch Firestore data
        }
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Fetch user data from Firestore
  const fetchUserData = async (userId: string) => {
    try {
      const userDoc = await getDoc(doc(FireStoreDB, "users", userId));
      if (userDoc.exists()) {
        //@ts-ignore

        setUserData(userDoc.data());
      } else {
        console.log("No such document!");
        setUserData(null);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      setUserData(null);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      "Confirm Logout",
      "Are you sure you want to log out?",
      [
        {
          text: "Cancel",
          onPress: () => console.log("Logout canceled"),
          style: "cancel",
        },
        {
          text: "Yes",
          onPress: () => {
            FireBaseAuth.signOut()
              .then(() => {
                console.log("User signed out");
              })
              .catch((error) => {
                console.error("Error signing out:", error);
              });
          },
        },
      ],
      { cancelable: false }
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFFFFF" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.content}>
          <Text style={styles.title}>Welcome to Your Profile</Text>
          {user ? (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>User Profile Information</Text>
              {userData ? (
                <>
                  <Text style={styles.cardText}>
                    Username:{" "}
                    {
                      //@ts-ignore
                      userData.username || "N/A"
                    }
                  </Text>
                  <Text style={styles.cardText}>
                    Phone:{" "}
                    {
                      //@ts-ignore

                      userData.phone || "N/A"
                    }
                  </Text>
                  <Text style={styles.cardText}>
                    Location:{" "}
                    {
                      //@ts-ignore

                      userData.city || "N/A"
                    }
                  </Text>
                  
                  {/* <Text style={styles.cardText}>Location: {userData.location || 'N/A'}</Text> */}
                </>
              ) : (
                <Text style={styles.cardText}>
                  No additional data found in Firestore.
                </Text>
              )}
              {/* <Text style={styles.cardText}>Name: {user.displayName || 'N/A'}</Text> */}
              <Text style={styles.cardText}>Email: {user.email}</Text>
              <Text style={styles.cardText}>UID: {user.uid}</Text>
            </View>
          ) : (
            <Text style={styles.text}>No user data available.</Text>
          )}
          <Button title="Logout" onPress={handleLogout} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  scrollContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
  },
  content: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#343A40",
    marginBottom: 20,
  },
  text: {
    fontSize: 18,
    color: "#495057",
    marginBottom: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#007BFF",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 20,
    width: "90%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 10,
    marginBottom: 20,
    alignItems: "flex-start",
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#343A40",
    marginBottom: 12,
  },
  cardText: {
    fontSize: 18,
    color: "#495057",
    marginBottom: 8,
  },
});

export default ProfileScreen;

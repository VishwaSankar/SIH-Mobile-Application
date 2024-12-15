import React, { useState, useEffect } from "react";
import axios from 'axios' // Import Axios library

import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Button,
  Modal,
  TextInput,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
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
  setDoc,
} from "firebase/firestore";
import { ProgressBar, Card } from "react-native-paper";
import WeatherScreen from "./WeatherInfo";
import { MaterialIcons } from "@expo/vector-icons";
import { Avatar } from "react-native-paper";

//send data to the backend








// Fetch latitude and longitude of a given city using OpenWeather API
const fetchLatLon = async (cityName: string) => {
  const [refreshing, setRefreshing] = React.useState(false);

  
  const API_KEY = "f41364f7b07c8996fd4434f1966cd65a"; // Replace with your OpenWeather API key
  try {
    const response = await fetch(
      ` http://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`
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

const FrontScreen = ({ navigation }) => {
  const [devices, setDevices] = useState<any[]>([]);
  const [filteredDevices, setFilteredDevices] = useState<any[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [deviceName, setDeviceName] = useState("");
  const [deviceNumber, setDeviceNumber] = useState("");
  const [userName, setUserName] = useState("");
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState("");
  const[refresh,setRefresh]=useState(false);
  const [latLon, setLatLon] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const auth = getAuth();
  const user = auth.currentUser;
  const handleLogin = async () => {
    // Mark this function as async
    const auth = getAuth();
    const user = auth.currentUser;

    if (user) {
      const token = await user.getIdToken(); // Now we can use await here
     // console.log("Firebase Auth Token:", token);
      // Continue with your logic here, like sending the token to your backend
    } else {
      console.log("User not authenticated");
    }
  };


  handleLogin();


  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);
  const avatars = [
    // {
    //   uri: "https://st.depositphotos.com/1033604/2008/i/450/depositphotos_20087015-stock-photo-sunlit-young-corn-plants.jpg",
    //   label: "Crop Health",
    //   screen: "CropInfo", // Screen name for navigation
    // },
    // {
    //   uri: "https://d1nhio0ox7pgb.cloudfront.net/_img/g_collection_png/standard/512x512/remote_control2.png",
    //   label: "Manual Control",
    //   screen: "ManualControl", // Screen name for navigation
    // },
    {
      uri: "https://static.vecteezy.com/system/resources/previews/000/554/759/non_2x/lightbulb-vector-icon.jpg",
      label: "Recommend",
      screen: "Recommendation", // Screen name for navigation
    },
    // {
    //   uri: "https://static-00.iconduck.com/assets.00/chat-icon-2048x2048-i7er18st.png",
    //   label: "Contact",
    //   screen: null, // No navigation yet
    // },
  ];
  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const userDocRef = doc(FireStoreDB, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          const username = userData.username || user.email;
          setUserName(username);

          const devicesQuery = query(
            collection(FireStoreDB, "devices"),
            where("userName", "==", username)
          );
          const devicesSnapshot = await getDocs(devicesQuery);

          const devicesList = devicesSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setDevices(devicesList);
          setFilteredDevices(devicesList);
        } else {
          console.log("No user profile found");
        }
      } catch (error) {
        console.error("Error fetching devices:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchDevices();
    }
  }, [user]);

  const addDevice = async () => {
    if (deviceName && deviceNumber) {
      const newDevice = {
        name: deviceName.trim(),
        number: deviceNumber.trim(),
        isActive: true,
        userName: userName,
      };

      try {
        await setDoc(
          doc(FireStoreDB, "devices", deviceNumber.trim()),
          newDevice
        );
        setDevices((prevDevices) => [...prevDevices, newDevice]);
        setFilteredDevices((prevDevices) => [...prevDevices, newDevice]);
        setModalVisible(false);
        setDeviceName("");
        setDeviceNumber("");
      } catch (error) {
        console.error("Error adding device to Firestore:", error);
      }
    } else {
      console.log("Please enter both device name and number");
    }
  };

  const handleLocationSearch = async () => {
    console.log("Searching for location:", location);
    if (location) {
      try {
        const { latitude, longitude } = await fetchLatLon(location);
        setLatLon({ latitude, longitude });
        console.log("Fetched Latitude and Longitude:", latitude, longitude);
      } catch (error) {
        console.error("Error fetching location:", error.message);
      }
    } else {
      console.log("Please enter a valid location.");
    }
  };
  const sendDataToServer = async () => {
    try {
      const auth = getAuth();
      const user = auth.currentUser ;
  
      if (user) {
        const idToken = await user.getIdToken(); // Get Firebase ID token
        console.log("IdToken:", idToken);
  
        // Make Axios POST request with the token in the headers
        const response = await axios.post(
          'http://192.168.45.75:5000/user',
          { data: 'Your data here' },
          {
            headers: {
              Authorization: `Bearer ${idToken}`, // Include the ID token in the Authorization header
            },
          }
        );
  
        console.log('Successfully connected to backend:', response.data);
      } else {
        console.log("User  not authenticated");
      }
    } catch (error) {
      if (error.response) {
        console.log('Backend returned an error:', error.response.data);
      } else if (error.request) {
        console.log('No response received from backend. Connection might have failed:', error);
      } else {
        console.log('Error setting up request:', error);
      }
    }
  };
  

  

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer} >
        <View style={styles.header}>
          {/* <View style={styles.locationContainer}>
            <MaterialIcons name="location-on" size={24} color="gray" />
            <TextInput
              style={styles.locationInput}
              placeholder="Enter location"
              value={location}
              onChangeText={setLocation}
            />
            <TouchableOpacity onPress={handleLocationSearch}>
              <MaterialIcons name="search" size={24} color="black" />
            </TouchableOpacity>
          </View> */}
          <Text style={styles.text}>
            <MaterialIcons name="person-outline" size={25} color="black" />
            Welcome, {userName}!
          </Text>
        </View>
        <WeatherScreen location={latLon} />
        <View style={styles.avatarContainer}>
          {avatars.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.item}
              onPress={() => {
                if (item.screen) {
                  navigation.navigate(item.screen);
                }
              }}
            >
              <Avatar.Image
                size={80}
                source={{ uri: item.uri }}
                style={styles.avatar}
              />
              <Text style={styles.textava}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Modal for adding device */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>
                <MaterialIcons
                  name="add-circle-outline"
                  size={24}
                  color="blue"
                />{" "}
                Add a new device
              </Text>
              <TextInput
                style={styles.input}
                placeholder="Device Name"
                value={deviceName}
                onChangeText={setDeviceName}
              />
              <TextInput
                style={styles.input}
                placeholder="Device Serial Number"
                value={deviceNumber}
                onChangeText={setDeviceNumber}
                keyboardType="numeric"
              />
              <View style={styles.modalButtons}>
                <Button title="Cancel" onPress={() => setModalVisible(false)} />
                <Button title="Add" onPress={addDevice} />
              </View>
            </View>
          </View>
        </Modal>

        {loading ? (
          <ActivityIndicator
            size="large"
            color="blue"
            style={styles.loadingIndicator}
          />
        ) : filteredDevices.length > 0 ? (
          <>
            <View style={styles.devicesContainer}>
              {filteredDevices.map((device, index) => (
                <Card key={index} style={styles.deviceCard}>
                  <View style={styles.deviceCardContent}>
                    <MaterialIcons
                      name="devices"
                      size={30}
                      color="blue"
                      style={styles.deviceIcon}
                    />
                    <View>
                      <Text style={styles.deviceName}>{device.name}</Text>
                      <Text style={styles.deviceNumber}>
                        <MaterialIcons name="vpn-key" size={16} color="gray" />{" "}
                        Device Number: {device.number}
                      </Text>
                      <Text style={styles.deviceUserName}>
                        <MaterialIcons name="person" size={16} color="gray" />{" "}
                        User: {device.userName}
                      </Text>
                      <Text style={styles.deviceStatus}>
                        <MaterialIcons
                          name={device.isActive ? "check-circle" : "cancel"}
                          size={16}
                          color={device.isActive ? "green" : "red"}
                        />{" "}
                        Status: {device.isActive ? "Active" : "Inactive"}
                      </Text>
                      <Text style={styles.deviceStatus}>
                        <MaterialIcons
                          name="location-city"
                          size={16}
                          color="gray"
                        />{" "}
                        City: {device.city}
                      </Text>
                      <Text style={styles.deviceStatus}>
                        <MaterialIcons name="place" size={16} color="gray" />{" "}
                        Coordinates: {device.latitude}, {device.longitude}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.cardActions}>
                    <MaterialIcons name="delete" size={24} color="red" />
                  </View>
                </Card>
              ))}
            </View>
            <Button
              title="Add a New Device"
              onPress={() => setModalVisible(true)}
              icon={<MaterialIcons name="add-circle" size={20} color="white" />}
            />
          </>
        ) : (
          <View style={styles.noDevicesContainer}>
            <MaterialIcons name="cloud-off" size={48} color="gray" />
            <Text style={styles.noDevicesText}>No devices added yet.</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    justifyContent: "flex-start",
    paddingHorizontal: 8,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "flex-start",
  },
  header: {
    marginVertical: 20,
    alignItems: "center",
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  locationInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginRight: 8,
    width: 200,
    height: 40,
    borderColor: "#ccc",
    marginVertical: 10,
  },
  text: {
    fontSize: 30,
    fontWeight: "bold",
    color: "black",
  },
  loadingIndicator: {
    marginTop: 50,
  },
  deviceCard: {
    marginVertical: 10,
    padding: 15,
  },
  deviceCardContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  deviceIcon: {
    marginRight: 12,
  },
  deviceName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  deviceNumber: {
    fontSize: 14,
    color: "gray",
  },
  deviceUserName: {
    fontSize: 14,
    color: "gray",
  },
  deviceStatus: {
    fontSize: 14,
    marginTop: 5,
  },
  cardActions: {
    alignItems: "center",
    justifyContent: "center",
  },
  noDevicesContainer: {
    alignItems: "center",
    marginTop: 50,
  },
  noDevicesText: {
    fontSize: 18,
    color: "gray",
    marginTop: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 8,
    width: 300,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginVertical: 10,
    height: 40,
    borderColor: "#ccc",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  avatarContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 20,
  },
  item: {
    flexDirection: "column",
    alignItems: "center",
    marginVertical: 10,
    width: "25%", // Adjust width as needed
  },
  avatar: {
    marginBottom: 10,
  },
  textava: {
    textAlign: "center",
    fontSize: 14,
    fontWeight: "bold",
  },
});

export default FrontScreen;

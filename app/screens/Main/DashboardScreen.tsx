import React, { useState, useEffect } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View, Button, Modal, TextInput, ActivityIndicator, RefreshControl } from 'react-native';
import { getAuth } from 'firebase/auth';
import { FireStoreDB } from '../Auth/FirebaseAuth';
import { getDoc, collection, query, where, getDocs, doc, setDoc } from 'firebase/firestore';
import { MaterialIcons } from "@expo/vector-icons"; // changed to MaterialIcons
import { Card } from 'react-native-paper';
import { PieChart } from 'react-native-chart-kit'; // Import PieChart
import axios from 'axios';

const API_KEY = "f41364f7b07c8996fd4434f1966cd65a"; 
const API_URL = 'https://api.thingspeak.com/channels/2785871/feeds.json?results=2';

const DashboardScreen = () => {
  const [devices, setDevices] = useState<any[]>([]);
  const [deviceDate, setDeviceDate] = useState('');

  const [final,setFinal]=useState('');
  const [filteredDevices, setFilteredDevices] = useState<any[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [deviceName, setDeviceName] = useState('');
  const [deviceNumber, setDeviceNumber] = useState('');
  const [cityName, setCityName] = useState('');
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(true);
  const [thingSpeakData, setThingSpeakData] = useState(null);
  const[moisture,setMoisture]=useState('');
  const [refreshing, setRefreshing] = useState(false);

  const auth = getAuth();
  const user = auth.currentUser;
  useEffect(() => {
    const fetchThingSpeakData = async () => {
      try {
        const response = await axios.get(API_URL);
        console.log('ThingSpeak Data:', response.data); // Log data to the console
        setThingSpeakData(response.data); // Update state with fetched data
        setMoisture(response.data); // Store the response data in moisture state
      } catch (error: any) {
        console.error('Error fetching ThingSpeak data:', error.message);
      } finally {
        setLoading(false);
      }
    };
  
    fetchThingSpeakData();
  }, []);
  
  useEffect(() => {
    if (moisture && moisture.feeds) {
      // Loop through the feeds array
      moisture.feeds.forEach((feed, index) => {
        console.log(`Feed ${index + 1} - field1: ${feed.field1}`);
      });
  
      // Access the first feed's field1 value
      if (moisture.feeds.length > 0) {
        console.log('Specific field1 from first feed:', moisture.feeds[1].field1);
        setFinal(moisture.feeds[1].field1);
      }
    }
  }, [moisture]);

  console.log("Moisture Data:"+final);

  const mockDeviceData = {
    irrigationStatus: 'On',
    health: 'Good',
    battery: '85%',
    moisture: final, // Mock moisture data (percentage)
  };
  const npkData = [
    {
      name: 'Nitrogen',
      population: 30, // Mock Nitrogen value
      color: '#4caf50',
      legendFontColor: '#000',
      legendFontSize: 15,
    },
    {
      name: 'Phosphorus',
      population: 40, // Mock Phosphorus value
      color: '#ffeb3b',
      legendFontColor: '#000',
      legendFontSize: 15,
    },
    {
      name: 'Potassium',
      population: 30, // Mock Potassium value
      color: '#f44336',
      legendFontColor: '#000',
      legendFontSize: 15,
    },
  ];



  useEffect(() => {
    const fetchDevices = async () => {
      try {
        //@ts-ignore
        const userDocRef = doc(FireStoreDB, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          
          const username = userData.username || user.email;
          setUserName(username);

          const devicesQuery = query(
            collection(FireStoreDB, 'devices'),
            where('userName', '==', username)
          );
          const devicesSnapshot = await getDocs(devicesQuery);

          const devicesList = devicesSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
          setDevices(devicesList);
          setFilteredDevices(devicesList);
        } else {
          console.log('No user profile found');
        }
      } catch (error) {
        console.error('Error fetching devices:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchDevices();
    }
  }, [user]);
 
  // Fetching lat and lon from city name
  const fetchLatLon = async (cityName) => {
    try {
      const response = await fetch(
        `http://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`
      );
      const data = await response.json()
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

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const response = await axios.get(API_URL);
      setThingSpeakData(response.data);
      setMoisture(response.data);
      setFinal(response.data.feeds[1]?.field1 || '');
    } catch (error) {
      console.error('Error fetching ThingSpeak data:', error.message);
    } finally {
      setRefreshing(false);
    }
  };

  const addDevice = async () => {
    if (deviceName && deviceNumber && cityName) {
      try {
        const location = await fetchLatLon(cityName.trim());

        const newDevice = {
          name: deviceName.trim(),
          number: deviceNumber.trim(),
          city: cityName.trim(),
          latitude: location.latitude,
          longitude: location.longitude,
          isActive: true,
          userName: userName,
          
        };

        await setDoc(doc(FireStoreDB, 'devices', deviceNumber.trim()), newDevice);
        setDevices((prevDevices) => [...prevDevices, newDevice]);
        setFilteredDevices((prevDevices) => [...prevDevices, newDevice]);
        setModalVisible(false);
        setDeviceName('');
        setDeviceNumber('');
        setCityName('');
      } catch (error) {
        console.error('Error adding device to Firestore:', error);
      }
    } else {
      console.log('Please enter all required fields');
    }
  };

  const moistureValue = parseFloat(final) || 0; // Ensure final is parsed correctly
  const moistureData = [
    {
      name: 'Moisture',
      population: moistureValue, // Use dynamic moisture value
      color: '#4caf50', // Green for moisture
      legendFontColor: '#000',
      legendFontSize: 15,
    },
    {
      name: 'Dry',
      population: Math.max(0, 100 - moistureValue), // Remaining percentage, minimum 0
      color: '#f44336', // Red for dry
      legendFontColor: '#000',
      legendFontSize: 15,
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
          />
        }
      >
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)} >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Add a new device</Text>
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
              <TextInput
                style={styles.input}
                placeholder="City Name"
                value={cityName}
                onChangeText={setCityName}
              />
             <TextInput
        style={styles.input}
        placeholder="Date (ddmmyyyy)"
        value={deviceDate}
        onChangeText={setDeviceDate}
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
          <ActivityIndicator size="large" color="blue" style={styles.loadingIndicator} />
        ) : filteredDevices.length > 0 ? (
          <View style={styles.devicesContainer}>
            {filteredDevices.map((device, index) => (
              <Card key={index} style={styles.deviceCard}>
                <View style={styles.deviceCardContent}>
                  <MaterialIcons
                    name="devices"
                    size={40}
                    color="blue"
                    style={styles.deviceIcon}
                  />
                  <View>
                    <Text style={styles.deviceName}>{device.name}</Text>
                    <Text style={styles.deviceNumber}>
                      <MaterialIcons name="vpn-key" size={16} color="blue" />{" "}
                      Device Number: {device.number}
                    </Text>
                    <Text style={styles.deviceUserName}>
                      <MaterialIcons name="person" size={16} color="red" />{" "}
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

                {/* Pie Chart Showing Moisture */}
                <View style={styles.chartContainer}>
                  <PieChart
                    data={moistureData}
                    width={400} // Set chart width
                    height={180} // Set chart height
                    chartConfig={{
                      backgroundColor: '#e26a00',
                      backgroundGradientFrom: '#ff9800',
                      backgroundGradientTo: '#ff5722',
                      decimalPlaces: 0, // Optional: Show no decimal places
                      color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                      style: {
                        borderRadius: 34,
                        borderWidth:1,
                        borderColor:"black"
                      },
                    }}
                    accessor="population"
                    backgroundColor="transparent"
                    paddingLeft="15"
                  />


                </View>
              </Card>
            ))}
          </View>
        ) : (
          <Text style={styles.noDevicesText}>No devices added yet.</Text>
        )}

        <Button title="Add a New Device" onPress={() => setModalVisible(true)} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
    backgroundColor:"white"
  },
  scrollContainer: {
    paddingBottom: 100,
  },
  devicesContainer: {
    paddingBottom: 20,
  },
  deviceCard: {
    margin: 10,
    padding: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 25,
    elevation: 5,
  },
  deviceCardContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  deviceIcon: {
    marginRight: 10,
  },
  deviceName: {
    fontSize: 26,
    fontWeight: 'bold',
  },
  deviceNumber: {
    fontSize:20,
    color: 'black',
  },
  deviceUserName: {
    fontSize: 20,
    color: 'black',
  },
  deviceStatus: {
    fontSize: 20,
    marginTop: 5,
    color: 'black',
  },
  chartContainer: {
    alignItems: 'center',
    marginTop: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingLeft: 10,
    borderRadius: 5,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  loadingIndicator: {
    marginTop: 50,
  },
  noDevicesText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 18,
    color: 'gray',
  },
});

export default DashboardScreen;

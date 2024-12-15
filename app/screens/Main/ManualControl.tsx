import React, { useState, useEffect } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View, Button, TextInput, Switch } from 'react-native';
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Card } from 'react-native-paper';
import DropDownPicker from 'react-native-dropdown-picker'; // Import DropDownPicker
import { FireStoreDB } from '../Auth/FirebaseAuth';
import { getDoc, collection, query, where, getDocs, doc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

export default function ManualControl() {
  const [devices, setDevices] = useState<any[]>([]); // List of devices fetched from Firestore
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null); // Selected device's ID
  const [sensorStatus, setSensorStatus] = useState<boolean>(false); // Sensor status for the selected device
  const [onDuration, setOnDuration] = useState<string>(''); // On duration for the sensor
  const [offDuration, setOffDuration] = useState<string>(''); // Off duration for the sensor
  const [loading, setLoading] = useState<boolean>(true); // Loading state for fetching devices
  const [isOpen, setIsOpen] = useState<boolean>(false); // Dropdown open state

  const auth = getAuth();
  const user = auth.currentUser;

  // Fetch devices based on logged-in user
  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const userDocRef = doc(FireStoreDB, 'users', user?.uid || '');
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          const username = userData.username || user?.email;
          
          const devicesQuery = query(
            collection(FireStoreDB, 'devices'),
            where('userName', '==', username)
          );
          
          const devicesSnapshot = await getDocs(devicesQuery);
          const devicesList = devicesSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
          
          setDevices(devicesList);
          setLoading(false);
        } else {
          console.log('No user profile found');
        }
      } catch (error) {
        console.error('Error fetching devices:', error);
      }
    };

    if (user) {
      fetchDevices();
    }
  }, [user]); // Only fetch devices once on user login

  // Toggle sensor status (on/off)
  const toggleSensor = () => {
    setSensorStatus((prevStatus) => !prevStatus);
    console.log(`Sensor for device ${selectedDevice} turned ${!sensorStatus ? 'ON' : 'OFF'}`);
  };

  // Set durations for the sensor (on/off)
  const setTimeDurations = () => {
    if (onDuration && offDuration) {
      console.log(`Set sensor for device ${selectedDevice} ON for ${onDuration} mins and OFF for ${offDuration} mins.`);
      // Logic to send time durations to the backend or hardware
      setOnDuration('');
      setOffDuration('');
    } else {
      console.log('Please enter valid durations.');
    }
  };

  // Find the name of the selected device from the list
  const selectedDeviceName = selectedDevice
    ? devices.find((device) => device.id === selectedDevice)?.name
    : 'None';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Card style={styles.controlCard}>
          <Text style={styles.title}>Manual Sensor Control</Text>

          <View style={styles.row}>
            <Text style={styles.label}>Select Device:</Text>
            {/* DropDownPicker to display devices */}
            <DropDownPicker
              items={devices.map((device) => ({
                label: device.name, // Display name of device
                value: device.id,   // Device ID as value
              }))}
              value={selectedDevice} // Current selected device ID
              containerStyle={styles.pickerContainer}
              style={styles.picker}
              itemStyle={styles.pickerItem}
              dropDownStyle={styles.dropDownStyle}
              open={isOpen} // Control if dropdown is open
              setOpen={setIsOpen} // Set open state on click
              onChangeItem={(item) => setSelectedDevice(item.value)} // Update selected device on change
              placeholder="Select a device" // Placeholder text
            />
          </View>

          <Text style={styles.selectedDeviceText}>
            Selected Device: {selectedDeviceName}
          </Text>

          <View style={styles.row}>
            <Text style={styles.label}>Sensor Status:</Text>
            <Switch
              value={sensorStatus}
              onValueChange={toggleSensor}
              trackColor={{ false: 'gray', true: 'green' }}
              thumbColor={sensorStatus ? 'white' : 'white'}
            />
          </View>

          <TextInput
            style={styles.input}
            placeholder="Set ON Duration (mins)"
            value={onDuration}
            onChangeText={setOnDuration}
            keyboardType="numeric"
          />
          <TextInput
            style={styles.input}
            placeholder="Set OFF Duration (mins)"
            value={offDuration}
            onChangeText={setOffDuration}
            keyboardType="numeric"
          />
          <Button title="Set Durations" onPress={setTimeDurations} />

          <View style={styles.statusContainer}>
            <MaterialCommunityIcons
              name={sensorStatus ? "power" : "power-off"}
              size={50}
              color={sensorStatus ? "green" : "red"}
            />
            <Text style={styles.statusText}>
              Sensor is currently {sensorStatus ? "ON" : "OFF"}
            </Text>
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    justifyContent: 'flex-start',
    paddingHorizontal: 16,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'flex-start',
  },
  controlCard: {
    marginVertical: 20,
    padding: 20,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  label: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  pickerContainer: {
    height: 50,
    width: 200,
  },
  picker: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
  },
  pickerItem: {
    justifyContent: 'flex-start',
  },
  dropDownStyle: {
    backgroundColor: '#f9f9f9',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginVertical: 10,
    fontSize: 16,
    backgroundColor: 'white',
  },
  statusContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  statusText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
    color: '#555',
},
selectedDeviceText: {
fontSize: 16,
marginBottom: 10,
color: '#555',
},
});

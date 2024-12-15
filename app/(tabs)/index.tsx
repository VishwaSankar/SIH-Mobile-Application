import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, Text, StyleSheet, Platform, StatusBar as RNStatusBar, TouchableOpacity } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { onAuthStateChanged, User } from 'firebase/auth';
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from '@react-navigation/native';
import { FireBaseAuth } from '../screens/Auth/FirebaseAuth';
import DashboardScreen from '../screens/Main/DashboardScreen';
import WeatherScreen from '../screens/Main/WeatherInfo';
import RecomScreen from '../screens/Main/RecomScreen';
import ProfileScreen from '../screens/Main/ProfileScreen';
import FrontScreen from '../screens/Main/Home';
import SignupScreen from '../screens/Auth/SignupScreen';
import LoginScreen from '../screens/Auth/LoginScreen';
import VoiceAssist from '../screens/Main/VoiceAssist';
import ManualControl from '../screens/Main/ManualControl';
import { usePushNoti } from '../usePushNoti';
import CropInfo from '../screens/Main/CropInfo';

const Tab = createBottomTabNavigator();
const AuthStack = createNativeStackNavigator();
const MainStack = createNativeStackNavigator();


function AuthStackNavigator() {
  return (
    <AuthStack.Navigator>
      <AuthStack.Screen
        name="Login"
        component={LoginScreen}
        options={{ headerShown: false }}
      />
      <AuthStack.Screen
        name="Signup"
        component={SignupScreen}
        options={{ headerShown: false }}
      />
    </AuthStack.Navigator>
  );
}

function MainAppNavigator() {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        tabBarLabelPosition: 'below-icon',
        tabBarActiveTintColor: 'green',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          switch (route.name) {
            case 'Home':
              iconName = focused ? 'home' : 'home-filled';
              break;
            case 'Dashboard':
              iconName = focused ? 'show-chart' : 'show-chart';
              break;
            case 'Recommendation':
              iconName = focused ? 'lightbulb' : 'lightbulb-outline';
              break;
            case 'Profile':
              iconName = focused ? 'person' : 'person-outline';
              break;
            default:
              iconName = 'help-outline';
          }
          return (
            <MaterialIcons
              name={iconName}
              size={size || 24}
              color={color}
            />
          );
        },
      })}
    >
      
      <Tab.Screen name="Home" component={HomeTabNavigator} />
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Recommendation" component={RecomScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

// HomeTabNavigator will handle navigation inside the "Home" tab
function HomeTabNavigator() {
  return (
    <MainStack.Navigator>
      <MainStack.Screen
        name="HomeMain"
        component={FrontScreen}
        options={{ headerShown: false }}
      />
      <MainStack.Screen
        name="CropInfo"
        component={CropInfo}
        options={{ headerShown: false }}
      />
      
      <MainStack.Screen
        name="VoiceAssist"
        component={VoiceAssist}
        options={{ title: 'Voice Assistance',headerShown:false }}
      />
      <MainStack.Screen
        name="ManualControl"
        component={ManualControl}
        options={{ title: 'Manual Control',headerShown:false }}
      />
    </MainStack.Navigator>
  );
}

export default function HomeScreen() {
  const{expoPushToken,notification}=usePushNoti();
  console.log(expoPushToken?.data ?? "");
  console.log(expoPushToken?.data);
  
  
  

  const data= JSON.stringify(notification,undefined,2);

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(FireBaseAuth, (currentUser) => {
      console.debug('Auth state changed:', currentUser);
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="blue" />
      </View>
    );
  }

  return (
    <>
      <View style={styles.statusBar}>
        <Text style={styles.appTitle}>Smart Irrigation System</Text>
      </View>
      {user ? (
        <MainAppNavigator />
      ) : (
        <AuthStackNavigator />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  statusBar: {
    paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight : 0,
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
  },
  appTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    padding: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});

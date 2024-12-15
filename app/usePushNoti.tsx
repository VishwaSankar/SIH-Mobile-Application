import { useState, useEffect, useRef } from "react";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform, Vibration } from "react-native";
import Constants from "expo-constants";

export interface PushNotificationState {
  notification?: Notifications.Notification;
  expoPushToken?: Notifications.ExpoPushToken;
}

export const usePushNoti = (): PushNotificationState => {
  // Set notification handler
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: false,
      shouldShowAlert: true,
      shouldSetBadge: false,
    }),
  });

  const [expoPushToken, setExpoPushToken] = useState<
    Notifications.ExpoPushToken | undefined
  >();

  const [notification, setNotification] = useState<
    Notifications.Notification | undefined
  >();

  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();

  async function registerForPushNotificationAsync() {
    let token;
    try {
      if (Device.isDevice) {
        const { status: existingStatus } =
          await Notifications.getPermissionsAsync();

        let finalStatus = existingStatus;
        if (existingStatus !== "granted") {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }
        if (finalStatus !== "granted") {
          alert("Failed to get push token!");
          return;
        }

        token = await Notifications.getExpoPushTokenAsync({
          projectId: Constants.expoConfig?.extra?.eas?.projectId,
        });

        console.log("Expo Push Token:", token?.data ?? "No Token Retrieved");

        if (Platform.OS === "android") {
          await Notifications.setNotificationChannelAsync("default", {
            name: "default",
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: "#FF231F7C",
          });
        }
      } else {
        console.log("Push notifications are only supported on physical devices.");
      }
    } catch (error) {
      console.error("Error registering for push notifications:", error);
    }
    return token;
  }

  useEffect(() => {
    registerForPushNotificationAsync().then((token) => {
      setExpoPushToken(token);
    });

    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        setNotification(notification);
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log("Notification response received:", response);
      });

    return () => {
      Notifications.removeNotificationSubscription(notificationListener.current!);
      Notifications.removeNotificationSubscription(responseListener.current!);
    };
  }, []);

  return {
    expoPushToken,
    notification,
  };
};





// const sendDataToServer = async () => {
//     try {
//       const auth = getAuth();
//       const user = auth.currentUser ;
  
//       if (user) {
//         const idToken = await user.getIdToken(); // Get Firebase ID token
//         console.log("IdToken:", idToken);
  
//         // Make Axios POST request with the token in the headers
//         const response = await axios.post(
//           'http://192.168.45.75:5000/user',
//           { data: 'Frontend and Backend Connected Successfully' },
//           {
//             headers: {
//               Authorization: `Bearer ${idToken}`, // Include the ID token in the Authorization header
//             },
//           }
//         );
  
//         console.log('Successfully connected to backend:', response.data);
//       } else {
//         console.log("User  not authenticated");
//       }
//     } catch (error) {
//       if (error.response) {
//         console.log('Backend returned an error:', error.response.data);
//       } else if (error.request) {
//         console.log('No response received from backend. Connection might have failed:', error);
//       } else {
//         console.log('Error setting up request:', error);
//       }
//     }
//   };
  
//   sendDataToServer();
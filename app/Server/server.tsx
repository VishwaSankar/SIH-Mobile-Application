import axios from 'axios';
import { getAuth } from 'firebase/auth';

const sendDataToServer = async (data) => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken(); // Get the Firebase Auth token

      const response = await axios.post(
        'http://localhost:5000/receiveData', 
        { data },

        {
          headers: {
            Authorization: `Bearer ${token}`, // Attach the token in the Authorization header
          }
        }
      );

      console.log('Server Response:', response.data);
    }
  } catch (error) {
    console.error('Error sending data:', error);
  }
};

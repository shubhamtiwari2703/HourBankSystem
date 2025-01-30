import React, {useState, useEffect} from 'react';
import {View, Text, StyleSheet, ScrollView} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

import RoleTabs from './src/components/RoleTabs';
import FacultyDashboard from './src/components/FacultyDashboard';
import StudentDashboard from './src/components/StudentDashboard';
import LoginScreen from './src/components/LoginScreen';
import RegisterScreen from './src/components/RegisterScreen';

const Stack = createStackNavigator();

const API_URL = 'http://192.168.0.105:5000';
//const API_URL = 'http://127.0.0.1:5000';

export default function App() {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkLoginStatus();
  }, []);

  const checkLoginStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        const response = await axios.get(`${API_URL}/user`, {
          headers: {Authorization: `Bearer ${token}`},
        });
        setUserRole(response.data.role);
        setUser(response.data.user);
      }
    } catch (error) {
      console.error('Error checking login status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (token: string, role: string) => {
    await AsyncStorage.setItem('token', token);
    setUserRole(role);
    checkLoginStatus();
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('token');
    setUserRole(null);
    setUser(null);
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {!userRole ? (
          <>
            <Stack.Screen name="Login">
              {props => <LoginScreen {...props} onLogin={handleLogin} />}
            </Stack.Screen>
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        ) : (
          <Stack.Screen name="Dashboard" options={{headerShown: false}}>
            {() => (
              <View style={styles.container}>
                <Text style={styles.header}>Hour Bank System</Text>
                <RoleTabs userRole={userRole} setUserRole={setUserRole} />
                <ScrollView>
                  {userRole === 'faculty' && <FacultyDashboard user={user} />}
                  {userRole === 'student' && <StudentDashboard user={user} />}
                </ScrollView>
                <Text onPress={handleLogout} style={styles.logoutButton}>
                  Logout
                </Text>
              </View>
            )}
          </Stack.Screen>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f8f9fa',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  logoutButton: {
    color: 'blue',
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
  },
});

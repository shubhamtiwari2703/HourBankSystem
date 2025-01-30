import React, {useState, useEffect} from 'react';
import {View, Text, StyleSheet, FlatList} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://localhost:5000/api';

interface Program {
  _id: string;
  prg_name: string;
  credits: number;
  event_date: string;
}

const StudentDashboard: React.FC<{user: any}> = ({user}) => {
  const [programs, setPrograms] = useState<Program[]>([]);

  useEffect(() => {
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.get(`${API_URL}/programs`, {
        headers: {Authorization: `Bearer ${token}`},
      });
      setPrograms(response.data);
    } catch (error) {
      console.error('Error fetching programs:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome, {user.name}</Text>
      <Text style={styles.subtitle}>Your Credits: {user.credits}</Text>
      <Text style={styles.subtitle}>Available Programs:</Text>
      <FlatList
        data={programs}
        keyExtractor={item => item._id}
        renderItem={({item}) => (
          <View style={styles.programItem}>
            <Text style={styles.programName}>{item.prg_name}</Text>
            <Text>Credits: {item.credits}</Text>
            <Text>Date: {new Date(item.event_date).toLocaleDateString()}</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  programItem: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    marginBottom: 8,
    borderRadius: 4,
  },
  programName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
});

export default StudentDashboard;

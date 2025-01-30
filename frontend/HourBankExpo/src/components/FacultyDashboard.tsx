import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://localhost:5000/api';

interface Program {
  _id: string;
  prg_name: string;
  credits: number;
  event_date: string;
}

const FacultyDashboard: React.FC<{user: any}> = ({user}) => {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [newProgram, setNewProgram] = useState({
    prg_name: '',
    credits: '',
    event_date: '',
  });

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

  const createProgram = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      await axios.post(`${API_URL}/programs`, newProgram, {
        headers: {Authorization: `Bearer ${token}`},
      });
      setNewProgram({prg_name: '', credits: '', event_date: ''});
      fetchPrograms();
    } catch (error) {
      console.error('Error creating program:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome, {user.name}</Text>
      <View style={styles.formContainer}>
        <TextInput
          style={styles.input}
          placeholder="Program Name"
          value={newProgram.prg_name}
          onChangeText={text => setNewProgram({...newProgram, prg_name: text})}
        />
        <TextInput
          style={styles.input}
          placeholder="Credits"
          value={newProgram.credits}
          onChangeText={text => setNewProgram({...newProgram, credits: text})}
          keyboardType="numeric"
        />
        <TextInput
          style={styles.input}
          placeholder="Event Date (YYYY-MM-DD)"
          value={newProgram.event_date}
          onChangeText={text =>
            setNewProgram({...newProgram, event_date: text})
          }
        />
        <TouchableOpacity style={styles.button} onPress={createProgram}>
          <Text style={styles.buttonText}>Create Program</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.subtitle}>Your Programs:</Text>
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
  formContainer: {
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 8,
    marginBottom: 8,
  },
  button: {
    backgroundColor: '#007bff',
    padding: 12,
    alignItems: 'center',
    borderRadius: 4,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
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

export default FacultyDashboard;

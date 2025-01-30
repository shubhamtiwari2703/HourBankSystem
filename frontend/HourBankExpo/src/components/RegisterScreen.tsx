import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import axios from 'axios';

interface RegisterScreenProps {
  navigation: any;
}

const API_URL = 'http://localhost:5000/api';

const RegisterScreen: React.FC<RegisterScreenProps> = ({navigation}) => {
  const [name, setName] = useState('');
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [course, setCourse] = useState('');
  const [year, setYear] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async () => {
    setIsLoading(true);
    setError('');
    try {
      const userData =
        role === 'student'
          ? {roll: id, name, password, course, year: parseInt(year), role}
          : {fid: id, name, password, role};

      await axios.post(`${API_URL}/register`, userData);
      navigation.navigate('Login');
    } catch (err) {
      setError('Registration failed. Please try again.');
      console.error('Registration error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Register</Text>
      <TextInput
        style={styles.input}
        placeholder="Name"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="ID (Roll No. or Faculty ID)"
        value={id}
        onChangeText={setId}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <View style={styles.roleContainer}>
        <TouchableOpacity
          style={[styles.roleButton, role === 'student' && styles.activeRole]}
          onPress={() => setRole('student')}>
          <Text>Student</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.roleButton, role === 'faculty' && styles.activeRole]}
          onPress={() => setRole('faculty')}>
          <Text>Faculty</Text>
        </TouchableOpacity>
      </View>
      {role === 'student' && (
        <>
          <TextInput
            style={styles.input}
            placeholder="Course"
            value={course}
            onChangeText={setCourse}
          />
          <TextInput
            style={styles.input}
            placeholder="Year"
            value={year}
            onChangeText={setYear}
            keyboardType="numeric"
          />
        </>
      )}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      {isLoading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <TouchableOpacity
          style={styles.registerButton}
          onPress={handleRegister}>
          <Text style={styles.registerButtonText}>Register</Text>
        </TouchableOpacity>
      )}
      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.loginText}>Already have an account? Login</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  input: {
    width: '100%',
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  roleContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  roleButton: {
    padding: 10,
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: 'gray',
  },
  activeRole: {
    backgroundColor: 'lightblue',
  },
  registerButton: {
    backgroundColor: 'green',
    padding: 10,
    borderRadius: 5,
  },
  registerButtonText: {
    color: 'white',
    textAlign: 'center',
  },
  loginText: {
    marginTop: 20,
    color: 'blue',
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
  },
});

export default RegisterScreen;

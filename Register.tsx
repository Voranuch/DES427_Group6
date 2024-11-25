// app/register/index.tsx

import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useUser } from '@/context/userContext';
import Toast from 'react-native-toast-message';
import { Link, router } from 'expo-router';

const RegisterScreen = () => {
  const { register } = useUser();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    setLoading(true);
    try {
      await register(username, password);
      Toast.show({
        type: 'success',
        text1: 'Registration Successful',
      });
      router.replace('/login'); // Redirect to login after successful registration
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Registration Failed',
        text2: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={require('@/assets/images/app-logo.png')} 
        style={styles.logo}
      />
      <Text style={styles.title}>Join us</Text>
      <Text style={styles.subtitle}>Create your account</Text>
      <TextInput
        style={styles.input}
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
        placeholderTextColor="#777"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholderTextColor="#777"
      />
      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleRegister}
        disabled={loading}
      >
        <Text style={styles.buttonText}>{loading ? 'Registering...' : 'Register'}</Text>
      </TouchableOpacity>
      <Link href={'/login'}>
        <Text style={styles.link}>Already have an account? Login</Text>
      </Link>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f8ff', // Light sky blue background for airline theme
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: -5,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 5,
    textAlign: 'center',
    color: '#333',
    
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
    color: '#666',

  },
  input: {
    height: 40,
    width: '100%',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 15,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
    color: '#333',

  },
  button: {
    backgroundColor: '#6082B6', 
    paddingVertical: 10,
    borderRadius: 5,
    width: '100%',
    alignItems: 'center', 
    marginBottom: 15
  },
  buttonDisabled: {
    backgroundColor: '#B6D0E2', 
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',

  },
  link: {
    color: '#6082B6',
    marginTop: 15,
    textAlign: 'center',
    textDecorationLine: 'underline',

  },
});

export default RegisterScreen;
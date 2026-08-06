import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { View, Text, TouchableOpacity, Alert, TextInput } from 'react-native';

import { registerUser } from '../services/authService';

const RegisterScreen = ({ navigation }: { navigation: any }) => {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmpassword, setConfirmpassword] = useState('');
    const [username, setUsername] = useState('');

    const handleRegister = async () => {

    // 1. Validate inputs
    if (email.trim() === '') {
        Alert.alert('Error', 'Please enter your email.');
        return;
    }

    if (username.trim() === '') {
        Alert.alert('Error', 'Please enter your username.');
        return;
    }

    if (password.trim() === '') {
        Alert.alert('Error', 'Please enter your password.');
        return;
    }

    if (confirmpassword.trim() === '') {
        Alert.alert('Error', 'Please confirm your password.');
        return;
    }

    if (password !== confirmpassword) {
        Alert.alert('Error', 'Passwords do not match.');
        return;
    }

    // 2. Call Strapi
    try {

        const result = await registerUser(
            username,
            email,
            password
        );

        console.log(result);

        Alert.alert("Success", "Registration successful!");

        navigation.replace("LoginScreen");

    } catch (error: any) {

        Alert.alert(
            "Registration Failed",
            error.message
        );

    }
};

    return (
        <View style={{
            flex: 1,
            alignContent: 'center',
            backgroundColor: '#cedddff6',
        }}>
            <View>
                <Text style={{
                    margin: '20%',
                    fontSize: 24,
                    fontWeight: 'bold',
                    // margin: 10,
                    color: '#000'
                }}>
                    Register Screen
                </Text>
            </View>
            <View
                style={{
                    backgroundColor: '#fff',
                    marginTop: '40%',
                    margin: 10,
                    padding: 10,
                    borderRadius: 10,
                }}
            >
                <TextInput
                    placeholder="Enter your email"
                    value={email}
                    onChangeText={setEmail}
                    placeholderTextColor="#000"
                    style={{
                        backgroundColor: '#fff',
                        // margin: 10,
                        // padding: 10,
                        // borderRadius: 10,
                    }}
                />
            </View>

            <View
                style={{
                    backgroundColor: '#fff',
                    margin: 10,
                    padding: 10,
                    borderRadius: 10,
                }}
            >
                <TextInput
                    placeholder="Enter your username"
                    value={username}
                    onChangeText={setUsername}
                    placeholderTextColor="#000"
                    style={{
                        backgroundColor: '#fff',
                        // margin: 10,
                        // padding: 10,
                        // borderRadius: 10,
                    }}
                />
            </View>
            <View
                style={{
                    backgroundColor: '#fff',
                    margin: 10,
                    padding: 10,
                    borderRadius: 10,
                }}
            >
                <TextInput
                    placeholder="Enter your password"
                    value={password}
                    onChangeText={setPassword}
                    placeholderTextColor="#000"
                    style={{
                        backgroundColor: '#fff',
                        // margin: 10,
                        // padding: 10,
                        // borderRadius: 10,
                    }}
                >
                </TextInput>
            </View>
            <View
                style={{
                    backgroundColor: '#fff',
                    margin: 10,
                    padding: 10,
                    borderRadius: 10,
                }}
            >
                <TextInput
                    placeholder="Confirm your password"
                    value={confirmpassword}
                    onChangeText={setConfirmpassword}
                    placeholderTextColor="#000"
                    style={{
                        backgroundColor: '#fff',
                        // margin: 10,
                        // padding: 10,
                        // borderRadius: 10,
                    }}
                >
                </TextInput>
            </View>
            <View>
                <TouchableOpacity
                    style={{
                        backgroundColor: '#000',
                        margin: 10,
                        padding: 10,
                        borderRadius: 10,
                    }}
                    onPress={() => handleRegister()}
                >
                    <Text style={{
                        color: '#fff',
                        textAlign: 'center',
                        fontSize: 18,
                    }}>
                        Register
                    </Text>
                </TouchableOpacity>
            </View>
            <View>
            </View>

        </View>
    );


};


export default RegisterScreen;
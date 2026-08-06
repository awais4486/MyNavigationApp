import React from 'react';
import { View, Text, Button, TouchableOpacity } from 'react-native';
import { Platform, StyleSheet, ImageBackground, Alert, TextInput, Image } from 'react-native';

import { useState, useEffect, } from 'react';
import { ScrollView, FlatList, Pressable, } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@react-native-vector-icons/ionicons';

import asyncStorage from '@react-native-async-storage/async-storage';

import RegisterScreen from './RegisterScreen';
import { loginUser } from '../services/authService';

import AsyncStorage from '@react-native-async-storage/async-storage';

const loginscreen = ({ navigation }: { navigation: any }) => {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async () => {
        if (!email.trim()) {
            Alert.alert("Error", "Please enter your email");
            return;
        }

        else if (!password.trim()) {
            Alert.alert("Error", "Please enter your password");
            return;
        }

        // else{
        // navigation.navigate("Home");
        // }
        try {

            const result = await loginUser(
                email,
                password
            );

            Alert.alert(
                "Success",
                `Welcome ${result.user.username}`
            );
///////////////////////
            const token = await AsyncStorage.getItem('token');

            console.log(token);

            Alert.alert("Saved Token", token ?? "No token");
////////////////////////
            navigation.replace('Home');

        } catch (error: any) {

            Alert.alert(
                "Login Failed",
                error.message
            );

        }
    }

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
                    Login Screen
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
                    onChangeText={(text) => setEmail(text)}
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
                    onPress={() => handleLogin()}
                // onPress={handleLogin}
                >
                    <Text style={{
                        color: '#fff',
                        textAlign: 'center',
                        fontSize: 18,
                    }}>
                        Login
                    </Text>
                </TouchableOpacity>
            </View>
            <View>
                <TouchableOpacity
                    style={{
                        backgroundColor: '#000',
                        margin: 10,
                        padding: 10,
                        borderRadius: 10,
                    }}
                    // onPress={() => handleLogin()}
                    onPress={() => navigation.navigate('RegisterScreen')}
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



export default loginscreen;
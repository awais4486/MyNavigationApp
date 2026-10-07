import React from 'react';
import { View, Text, Button, TouchableOpacity } from 'react-native';
import { Platform, StyleSheet, ImageBackground, Alert, TextInput, Image } from 'react-native';

import { useState, useEffect, } from 'react';
import { ScrollView, FlatList, Pressable, } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { loginUser } from '../services/authService';
import { showNotification } from '../services/notifications';

const LoginScreen = ({ navigation }: { navigation: any }) => {

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

        try {

            const result = await loginUser(
                email,
                password
            );

            showNotification('Login successful', `Welcome ${result.user.username}!`);
            navigation.replace('Home');

        } catch (error: any) {

            Alert.alert(
                "Login Failed",
                error.message
            );

        }
    }

    const insets = useSafeAreaInsets();

    return (
        <View style={{
            flex: 1,
            paddingTop: insets.top + 10,
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
                    keyboardType="email-address"
                    autoCapitalize="none"
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
            <View
                style={{
                    alignItems: 'flex-end',
                    marginRight: 10,
                }}
            >
                <TouchableOpacity
                    onPress={() => navigation.navigate('ForgotScreen')}
                >
                    <Text
                        style={{
                            color: '#0d1be4',
                        }}
                    >Forgot Password?</Text>
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



export default LoginScreen;
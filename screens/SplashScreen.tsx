import React, { useEffect } from 'react';
import { View, Text, Button, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Platform, StyleSheet, ImageBackground, Alert, TextInput, Image } from 'react-native';

import { useState, } from 'react';
import { ScrollView, FlatList, Pressable, } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@react-native-vector-icons/ionicons';

import AsyncStorage from '@react-native-async-storage/async-storage';

const SplashScreen = ({ navigation }: { navigation: any }) => {

    useEffect(() => {
        const checkToken = async () => {
            const token = await AsyncStorage.getItem('token');
            Alert.alert("Token", token ??    "No token");
            if (token) {
                navigation.replace('Home');
            } else {
                navigation.replace('LoginScreen');
            }
        };
        checkToken();
    }, []);

    return (
        <View style={styles.container}>
            <Text style={{
                fontSize: 24,
            }}>Loading...</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default SplashScreen;
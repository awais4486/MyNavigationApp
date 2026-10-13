import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { sendPasswordResetEmail } from '../services/authService';
import { showNotification } from '../services/notifications';

const ForgotScreen = ({ navigation }: { navigation: any }) => {
    const [email, setEmail] = useState('');

    const handlePasswordReset = async () => {
        if (!email.trim()) {
            Alert.alert("Error", "Please enter your email");
            return;
        }

        try {
            await sendPasswordResetEmail(email);
            showNotification('Password Reset', 'A password reset email has been sent to your email address.');
            navigation.goBack();
        } catch (error: any) {
            Alert.alert("Error", error.message);
        }
    };

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#cedddff6' }}>
            <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>Forgot Password</Text>
            <TextInput
                style={{ height: 40, borderColor: 'gray', borderWidth: 1, width: '80%', marginBottom: 20, paddingHorizontal: 10 }}
                placeholder="Enter your email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
            />
            <TouchableOpacity
                style={{
                    backgroundColor: '#000',
                    margin: 10,
                    padding: 10,
                    borderRadius: 10,
                }}
                // onPress={() => navigation.navigate('RegisterScreen')}
            >
                <Text style={{
                    color: '#fff',
                    textAlign: 'center',
                    fontSize: 18,
                }}>
                    Forgot Password
                </Text>
            </TouchableOpacity>
        </View>
    );
};

export default ForgotScreen;
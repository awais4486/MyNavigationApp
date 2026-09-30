import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { StyleSheet, Alert, Image } from 'react-native';

import { useState, useEffect, useEffectEvent } from 'react';
import { ScrollView, Pressable, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { getAuthenticatedUser } from '../services/authService';

const STRAPI_URL = 'http://192.168.86.56:1337';

type ProfilePicture = {
  url?: string;
};

type ProfileUser = {
  id: number;
  profilePicture?: ProfilePicture | { data?: ProfilePicture } | null;
};

const getProfilePictureUrl = (profilePicture: ProfileUser['profilePicture']) => {
  const picture = profilePicture && 'data' in profilePicture
    ? profilePicture.data
    : profilePicture && 'url' in profilePicture
      ? profilePicture
      : null;

  if (!picture?.url) {
    return null;
  }

  return picture.url.startsWith('http') ? picture.url : `${STRAPI_URL}${picture.url}`;
};

const ProfileScreen = ({ navigation, route }: { navigation: any; route: any }) => {
  const [selectedTab, setSelectedTab] = useState('Basic Info');
  const [profilePictureUrl, setProfilePictureUrl] = useState<string | null>(null);
  const [isLoadingPicture, setIsLoadingPicture] = useState(true);
  const [isUploadingPicture, setIsUploadingPicture] = useState(false);
  const [isDeletingPicture, setIsDeletingPicture] = useState(false);

  useEffect(() => {
    const loadProfilePicture = async () => {
      try {
        const result = await getAuthenticatedUser();
        if (result) {
          setProfilePictureUrl(getProfilePictureUrl((result.user as ProfileUser).profilePicture));
        }
      } catch (error) {
        Alert.alert('Could not load profile', error instanceof Error ? error.message : 'Please try again.');
      } finally {
        setIsLoadingPicture(false);
      }
    };

    loadProfilePicture();
  }, []);

  const uploadProfilePicture = async (imageUri: string, token: string) => {
    const formData = new FormData();

    formData.append('files', {
      uri: imageUri,
      name: 'profile-picture.jpg',
      type: 'image/jpeg',
    } as any);

    const uploadResponse = await fetch(`${STRAPI_URL}/api/upload`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const uploadedFiles = await uploadResponse.json();
    if (!uploadResponse.ok || !uploadedFiles[0]?.id) {
      throw new Error(uploadedFiles.error?.message || 'Could not upload your profile picture.');
    }

    return uploadedFiles[0];
  };

  const saveProfilePicture = async (imageUri: string) => {
    setIsUploadingPicture(true);
    try {
      const authenticatedUser = await getAuthenticatedUser();
      if (!authenticatedUser) {
        navigation.replace('LoginScreen');
        return;
      }

      const uploadedFile = await uploadProfilePicture(imageUri, authenticatedUser.token);
      const updateResponse = await fetch(`${STRAPI_URL}/api/users/${authenticatedUser.user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authenticatedUser.token}`,
        },
        body: JSON.stringify({
          profilePicture: uploadedFile.id,
        }),
      });

      const updatedUser = await updateResponse.json();
      if (!updateResponse.ok) {
        throw new Error(updatedUser.error?.message || 'Could not save your profile picture.');
      }

      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      setProfilePictureUrl(getProfilePictureUrl(updatedUser.profilePicture) || `${STRAPI_URL}${uploadedFile.url}`);
    } catch (error) {
      Alert.alert('Could not change photo', error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setIsUploadingPicture(false);
    }
  };

  const processEditedPhoto = useEffectEvent((editedImageUri: string) => {
    navigation.setParams({ editedImageUri: undefined });
    saveProfilePicture(editedImageUri).catch(() => undefined);
  });

  useEffect(() => {
    const editedImageUri = route.params?.editedImageUri;
    if (editedImageUri) {
      processEditedPhoto(editedImageUri);
    }
  }, [route.params?.editedImageUri]);

  const handleChangePhoto = () => {
    Alert.alert('Change profile photo', 'Choose a photo source.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Camera', onPress: () => choosePhoto('camera') },
      { text: 'Photo library', onPress: () => choosePhoto('library') },
    ]);
  };

  const choosePhoto = async (source: 'camera' | 'library') => {
    const result = source === 'camera'
      ? await launchCamera({ mediaType: 'photo', cameraType: 'front', saveToPhotos: false })
      : await launchImageLibrary({ mediaType: 'photo', selectionLimit: 1 });

    if (result.didCancel || !result.assets?.[0]?.uri) {
      return;
    }

    navigation.navigate('ProfilePictureEditor', { imageUri: result.assets[0].uri });
  };

  const handleEditProfilePicture = () => {
    if (!profilePictureUrl) {
      handleChangePhoto();
      return;
    }

    navigation.navigate('ProfilePictureEditor', { imageUri: profilePictureUrl });
  };

  const handleDeletePhoto = () => {
    Alert.alert('Delete profile picture', 'Remove your current profile picture?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setIsDeletingPicture(true);
          try {
            const authenticatedUser = await getAuthenticatedUser();
            if (!authenticatedUser) {
              navigation.replace('LoginScreen');
              return;
            }

            const updateResponse = await fetch(`${STRAPI_URL}/api/users/${authenticatedUser.user.id}`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authenticatedUser.token}`,
              },
              body: JSON.stringify({
                profilePicture: null,
              }),
            });

            const updatedUser = await updateResponse.json();
            if (!updateResponse.ok) {
              throw new Error(updatedUser.error?.message || 'Could not delete your profile picture.');
            }

            await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
            setProfilePictureUrl(null);
          } catch (error) {
            Alert.alert('Could not delete photo', error instanceof Error ? error.message : 'Please try again.');
          } finally {
            setIsDeletingPicture(false);
          }
        },
      },
    ]);
  };


  const handleLogout = async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');

    navigation.replace("LoginScreen");
  };

  return (
    <View style={{
      flex: 1,
      backgroundColor: '#cedddff6',
    }}>
      <ScrollView>
        <View
          style={{
            alignItems: 'center',
            marginTop: '5%',
            flexDirection: 'row',
            // backgroundColor: '#7de1e8',
          }}
        >
          <View
            style={{
              alignItems: 'center',
              marginTop: '5%',
              // padding: 10,

              // backgroundColor: '#589341',
            }}
          >
            <Text
              style={{
                fontSize: 20,
                fontWeight: 'bold'
              }}>
              Customize Your Profile
            </Text>
          </View>
          <TouchableOpacity onPress={handleLogout}>
            <View
              style={{  
                // alignItems: 'flex-start',
                marginTop: '10%',
                padding: 5,
                borderRadius: 20,
                borderWidth: 5,
                borderColor: '#6dd0d0',
                backgroundColor: '#6dd0d0',
              }}>
              <Text>
                Log Out
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        <View
          style={{
            alignItems: 'center',
            marginTop: '5%',
            // backgroundColor: '#7de1e8',
          }}
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Edit profile picture"
            disabled={isLoadingPicture || isUploadingPicture || isDeletingPicture}
            onPress={handleEditProfilePicture}
            style={{
              alignItems: 'center',
              // marginTop: '10%',
              // backgroundColor: '#7de1e8',
            }}
          >
            {isLoadingPicture ? (
              <View style={{ width: 120, height: 120, marginTop: '5%', borderRadius: 60, justifyContent: 'center', backgroundColor: '#e0e0e0' }}>
                <ActivityIndicator />
              </View>
            ) : (
              <Image
                source={profilePictureUrl ? { uri: profilePictureUrl } : require('./default.jpg')}
                style={{ width: 120, height: 120, marginTop: '5%', borderRadius: 60, borderWidth: 2, borderColor: '#589341' }}
              />
            )}
          </Pressable>
          <View
            style={{
              flexDirection: 'row',
            }}
          >
            <TouchableOpacity onPress={handleChangePhoto} disabled={isUploadingPicture || isDeletingPicture}>
              <View //change profile picture
                style={{
                  marginTop: '5%',
                  alignItems: 'center',
                  padding: 10,
                }}
              >
                <Text style={{ fontWeight: 'bold', fontSize: 14, color: '#000000', borderRadius: 20, backgroundColor: '#e0e0e0', padding: 10, paddingHorizontal: 20 }}>
                  {isUploadingPicture ? 'Uploading...' : 'Change Photo'}
                </Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDeletePhoto} disabled={isUploadingPicture || isDeletingPicture || !profilePictureUrl}>
              <View
                style={{
                  marginTop: '12%',
                  alignItems: 'center',
                  padding: 10,
                  backgroundColor : '#e0e0e0',
                  borderRadius : 30,
                }}>
                <Text style={{ fontWeight: 'bold', fontSize: 14, paddingHorizontal: 20, color: profilePictureUrl ? '#c62828' : '#999999' }}>
                  {isDeletingPicture ? 'Deleting...' : 'Delete Photo'}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
        <View
          style={{
            backgroundColor: '#fdfdfd',
          }}
        >
          <View style={[{ padding: 10, }]}>

            <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} style={{ marginBottom: 10, }}>
              <View
                style={{
                  flexDirection: 'row',
                  borderBottomWidth: 6,
                  borderBottomColor: '#afafad12',
                  paddingBottom: 5,
                  // backgroundColor: '#fdfdfd',
                }}
              >
                <View
                  style={{
                    flex: 1,
                    borderRadius: 9,
                    justifyContent: 'space-between',

                  }}
                >

                  <Pressable onPress={() => setSelectedTab('Basic Info')}>
                    <Text
                      style={{
                        fontWeight:
                          selectedTab === 'Basic Info'
                            ? 'bold'
                            : 'normal',
                        borderBottomWidth: selectedTab === 'Basic Info' ? 2 : 0,
                        borderBottomColor: '#000',
                        paddingBottom: 5,
                      }}
                    >
                      Basic Info
                    </Text>
                  </Pressable>

                </View>
                <View
                  style={{
                    flex: 1,
                    marginLeft: 10,
                    borderRadius: 9,
                    justifyContent: 'space-between',
                  }}
                >
                  <Pressable onPress={() => setSelectedTab('Appearance')}>
                    <Text
                      style={{
                        fontWeight:
                          selectedTab === 'Appearance'
                            ? 'bold'
                            : 'normal',
                        borderBottomWidth: selectedTab === 'Appearance' ? 2 : 0,
                        borderBottomColor: '#000',
                        paddingBottom: 5,
                      }}
                    >
                      Appearance
                    </Text>
                  </Pressable>
                </View>
                <View
                  style={{
                    flex: 1,
                    marginLeft: 10,
                    borderRadius: 9,
                    justifyContent: 'space-between',
                  }}
                >
                  <Pressable onPress={() => setSelectedTab('Preferences')}>
                    <Text
                      style={{
                        fontWeight:
                          selectedTab === 'Preferences'
                            ? 'bold'
                            : 'normal',
                        borderBottomWidth: selectedTab === 'Preferences' ? 2 : 0,
                        borderBottomColor: '#000',
                        paddingBottom: 5,
                      }}
                    >
                      Preferences
                    </Text>
                  </Pressable>
                </View>
                <View
                  style={{
                    flex: 1,
                    marginLeft: 10,
                    borderRadius: 9,
                    justifyContent: 'space-between',
                  }}
                >
                  <Pressable onPress={() => setSelectedTab('Account Settings')}>
                    <Text
                      style={{
                        fontWeight:
                          selectedTab === 'Account Settings'
                            ? 'bold'
                            : 'normal',
                        borderBottomWidth: selectedTab === 'Account Settings' ? 2 : 0,
                        borderBottomColor: '#000',
                        paddingBottom: 5,
                      }}
                    >
                      Account Settings
                    </Text>
                  </Pressable>
                </View>
                <View
                  style={{
                    flex: 1,
                    marginLeft: 10,
                    borderRadius: 9,
                    justifyContent: 'space-between',
                  }}
                >
                  <Pressable onPress={() => setSelectedTab('Privacy')}>
                    <Text
                      style={{
                        fontWeight:
                          selectedTab === 'Privacy'
                            ? 'bold'
                            : 'normal',
                        borderBottomWidth: selectedTab === 'Privacy' ? 2 : 0,
                        borderBottomColor: '#000',
                        paddingBottom: 5,
                      }}
                    >
                      Privacy
                    </Text>
                  </Pressable>
                </View>
              </View>
            </ScrollView>
            <View>
              <Text style={{ fontSize: 16, fontWeight: 'bold' }}>Profile Background</Text>
            </View>
            <View
              style={{
                marginTop: 10,
                flexDirection: 'row',
              }}>
              <View style={{
                width: 50,
                height: 50,
                margin: 5,
                backgroundColor: '#b3ec9d',
                borderRadius: 9,
                // marginRight: 10,
              }}>
              </View>
              <View style={{
                width: 50,
                height: 50,
                margin: 5,
                backgroundColor: '#20d1c2',
                borderRadius: 9,
                // marginRight: 10,
              }}>
              </View>
              <View
                style={{
                  width: 50,
                  height: 50,
                  margin: 5,
                  backgroundColor: '#c8d120',
                  borderRadius: 9,
                }}>

              </View>
              <View
                style={{
                  width: 50,
                  height: 50,
                  margin: 5,
                  backgroundColor: '#db89ea',
                  borderRadius: 9,
                }}>

              </View>

            </View>
            <View
              style={{
                marginTop: 10,
              }}
            >
              <Text
                style={{ fontSize: 16, fontWeight: 'bold' }}
              >
                Themes and Colours
              </Text>
            </View>
            <View
              style={{
                marginTop: 10,
                flexDirection: 'row',
              }}>
              <View style={{
                width: 50,
                height: 50,
                margin: 5,
                backgroundColor: '#b3ec9d',
                borderRadius: 9,
                // marginRight: 10,
              }}>
              </View>
              <View style={{
                width: 50,
                height: 50,
                margin: 5,
                backgroundColor: '#20d1c2',
                borderRadius: 9,
                // marginRight: 10,
              }}>
              </View>
              <View
                style={{
                  width: 50,
                  height: 50,
                  margin: 5,
                  backgroundColor: '#c8d120',
                  borderRadius: 9,
                }}>

              </View>
              <View
                style={{
                  width: 50,
                  height: 50,
                  margin: 5,
                  backgroundColor: '#db89ea',
                  borderRadius: 9,
                }}>

              </View>

            </View>

            <View
              style={{
                marginTop: 10,
              }}
            >
              <Text
                style={{ fontSize: 16, fontWeight: 'bold' }}
              >
                Interests and Hobbies
              </Text>
            </View>

            <View //interests and Hobbies Properties
              style={{
                flexDirection: 'row',
              }}
            >
              <Text
                style={{ fontSize: 16, borderRadius: 10, backgroundColor: '#aeb3b3', padding: 5, margin: 3 }}
              >Interests
              </Text>
              <Text
                style={{ fontSize: 16, borderRadius: 10, backgroundColor: '#aeb3b3', padding: 5, margin: 3 }}
              >Travel
              </Text>
              <Text
                style={{ fontSize: 16, borderRadius: 10, backgroundColor: '#aeb3b3', padding: 5, margin: 3 }}
              >Gaming
              </Text>
              <Text
                style={{ fontSize: 16, borderRadius: 10, backgroundColor: '#aeb3b3', padding: 5, margin: 3 }}
              >Design
              </Text>
            </View>

            <View
              style={{
                marginTop: 10,
              }}
            >
              <Text
                style={{ fontSize: 16, fontWeight: 'bold' }}
              >
                Font Styles
              </Text>
            </View>
            <View //Font Styles Properties
              style={{
                flexDirection: 'row',
              }}
            >
              <Text
                style={{ fontSize: 16, borderRadius: 10, backgroundColor: '#aeb3b3', padding: 5, margin: 3 }}
              >
                Montserrar
              </Text>
              <Text
                style={{ fontSize: 16, borderRadius: 10, backgroundColor: '#aeb3b3', padding: 5, margin: 3 }}
              >
                Calibri
              </Text>
            </View>
            <View
              style={{
                flexDirection: 'row',
              }}
            >
              <View
                style={{
                  marginTop: 10,
                }}
              >
                <Text
                  style={{ fontSize: 16, fontWeight: 'bold' }}
                >
                  Layout Options
                </Text>
              </View>
              <View
                style={{
                  // justifyContent: 'right',
                  // marginTop: 10,
                }}
              >
                <Text
                  style={{ marginLeft: '40%', fontSize: 16, borderRadius: 10, backgroundColor: '#aeb3b3', padding: 5, margin: 3 }}
                >
                  Grid Layout
                </Text>
              </View>
            </View>
            <View
              style={{
                marginTop: 5,
                flexDirection: 'row',
              }}
            >
              <TouchableOpacity>
                <View
                  style={{
                    backgroundColor: '#21a3e9bf',
                    borderRadius: 15,
                    padding: 10,
                    marginRight: 10,
                    paddingHorizontal: 35,
                    // marginTop: 20,
                  }}
                >

                  <Text
                    style={{
                      color: 'white',
                      fontWeight: 'bold',
                    }}
                  >Save Changes</Text>

                </View>
              </TouchableOpacity>

              <TouchableOpacity>
                <View
                  style={{
                    backgroundColor: '#819093',
                    borderRadius: 15,
                    padding: 10,
                    paddingHorizontal: 35,
                    // marginTop: 20,
                  }}
                >

                  <Text
                    style={{
                      color: 'white',
                      fontWeight: 'bold',
                    }}
                  >
                    Reset To Default
                  </Text>

                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    paddingLeft: 30,
    flex: 1,
    marginTop: 8,
    backgroundColor: 'aliceblue',
  },
  box: {
    width: 50,
    height: 50,
    margin: 5,
    // backgroundColor: '#20d1c2',
    borderRadius: 9,
    // marginRight: 10,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  button: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 4,
    backgroundColor: 'oldlace',
    alignSelf: 'flex-start',
    marginHorizontal: '1%',
    marginBottom: 6,
    minWidth: '48%',
    textAlign: 'center',
  },
  selected: {
    backgroundColor: 'coral',
    borderWidth: 0,
  },
  buttonLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: 'coral',
  },
  selectedLabel: {
    color: 'white',
  },
  label: {
    textAlign: 'center',
    marginBottom: 10,
    fontSize: 24,
  },
});

export default ProfileScreen;
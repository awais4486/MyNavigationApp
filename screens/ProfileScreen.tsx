import React from 'react';
import { View, Text, Button, TouchableOpacity } from 'react-native';
import { Platform, StyleSheet, ImageBackground, Alert, TextInput, Image } from 'react-native';

import { useState, useEffect, } from 'react';
import { ScrollView, FlatList, Pressable, } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const profileScreen = ({ navigation }: { navigation: any }) => {
  const [flexDirection, setflexDirection] = useState('column');
  const [selectedTab, setSelectedTab] = useState('Basic Info');
  const [products, setProducts] = useState([]);


  const handleLogout = async () => {
    await AsyncStorage.removeItem("jwt");

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
              marginTop: '10%',
              // padding: 10,

              // backgroundColor: '#589341',
            }}
          >
            <Text
              style={{
                fontSize: 30,
                fontWeight: 'bold'
              }}>
              Customize Your Profile
            </Text>
          </View>
          <TouchableOpacity onPress={handleLogout}>
            <View
              style={{
                marginTop: '25%',
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
          <View //profilepic
            style={{
              alignItems: 'center',
              // marginTop: '10%',
              // backgroundColor: '#7de1e8',
            }}
          >
            <Image
              source={require('./logo.jpg')}
              style={{ width: 120, height: 120, marginTop: '5%', borderRadius: 60, borderWidth: 2, borderColor: '#589341', }}
            />
          </View>
          <TouchableOpacity>
            <View //change profile picture
              style={{
                marginTop: '5%',
                alignItems: 'center',
                padding: 10,
              }}
            >
              <Text style={{ fontWeight: 'bold', fontSize: 14, color: '#000000', borderRadius: 20, backgroundColor: '#e0e0e0', padding: 10, paddingHorizontal: 20 }}>
                Change Photo
              </Text>
            </View>
          </TouchableOpacity>
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
              >[Interests]
              </Text>
              <Text
                style={{ fontSize: 16, borderRadius: 10, backgroundColor: '#aeb3b3', padding: 5, margin: 3 }}
              >[Travel]
              </Text>
              <Text
                style={{ fontSize: 16, borderRadius: 10, backgroundColor: '#aeb3b3', padding: 5, margin: 3 }}
              >[Gaming]
              </Text>
              <Text
                style={{ fontSize: 16, borderRadius: 10, backgroundColor: '#aeb3b3', padding: 5, margin: 3 }}
              >[Design]
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

export default profileScreen;
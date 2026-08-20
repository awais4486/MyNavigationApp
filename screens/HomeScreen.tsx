import React from 'react';
import { View, Text, Button, TouchableOpacity } from 'react-native';
import { Platform, StyleSheet, ImageBackground, Alert, TextInput, Image } from 'react-native';

// const HomeScreen = ({ navigation }: { navigation: any }) => {

import { useState, useEffect, } from 'react';
import { ScrollView, FlatList, Pressable, } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// import Ionicons from '@react-native-vector-icons/ionicons/static';
import { Search } from 'lucide-react-native';

const FlexDirectionBasics = ({ navigation }: { navigation: any }) => {
  const [flexDirection, setflexDirection] = useState('column');
  const [selectedCat, setSelectedCat] = useState('ALL');

  const [searchText, setsearchText] = useState('');

  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      console.log("fetchProducts() started");

      const response = await fetch(
        'http://localhost:1337/api/products?populate=category&pagination[page]=1&pagination[pageSize]=200'
      );

      const data = await response.json();

      // Alert.alert("PRODUCT DATA:", JSON.stringify(data, null, 2));

      // Alert.alert(data);

      setProducts(data.data);
    } catch (error) {
      console.log("ERROR:", error);
    }
  };

  const searchProducts = async (keyword: string) => {
    try {
      const response = await fetch(
        `http://localhost:1337/api/products?filters[title][$containsi]=${encodeURIComponent(keyword)}&populate=category&pagination[pageSize]=200`
      );

      const data = await response.json();

      setProducts(data.data);
    } catch (error) {
      console.log("SEARCH ERROR:", error);
    }
  };

  const filteredProducts = products.filter((item) => {

    const matchesCategory =
      selectedCat === 'ALL' ||
      item.category?.name?.toLowerCase() ===
      selectedCat.toLowerCase();

    const search = searchText.toLowerCase();

    const matchesSearch =
      item.title?.toLowerCase().includes(search) ||
      item.description?.toLowerCase().includes(search);

    return matchesCategory && matchesSearch;
  });

  return (
    // <ScrollView style={{ flex: 1, backgroundColor: '#e9f4f6', }}>
    <View style={{
      flex: 1,
      alignContent: 'center',
      backgroundColor: '#cedddff6',
    }}>
      <View
        style={{
          marginTop: '13%',
          marginLeft: '5%',
        }}
      >
        <Text
          style={{
            fontWeight: '700',
            fontSize: 33,
          }}
        >
          PRODUCT DISCOVERY
        </Text>
        <Text
          style={{
            fontWeight: '500',
            // fontSize: 33,
          }}
        >
          CURATED SELECTIONS
        </Text>
      </View>
      <View
        style={{
          flexDirection: 'row',
          marginHorizontal: '3%',
          backgroundColor: '#809292be',
          borderRadius: 5,
          // alignContent : 'center',
          justifyContent: 'space-between'
        }}
      >
        <View>
          <TextInput
            placeholder='Search Products...'
            value={searchText}
            onChangeText={setsearchText}
            style={{
              fontSize: 22,
              padding: 5,
            }}
          />
        </View>
        <View
          style={{
            alignContent: 'flex-start',
            justifyContent: 'flex-start',
          }}
        >
          <TouchableOpacity
            onPress={() => filteredProducts.filter((item: any) => (typeof item === 'string' ? item.toLowerCase().includes(searchText.toLowerCase()) : item.title?.toLowerCase().includes(searchText.toLowerCase())))}
          >
            <Search size={25} color={'#80d3d7'} />
          </TouchableOpacity>
        </View>
      </View>
      {/* // Product categories */}
      <ScrollView horizontal showsHorizontalScrollIndicator={true}> 
        <View
          style={{
            flexDirection: 'row',
            marginLeft: '1%',
            marginTop: '5%',
          }}
        >
          <TouchableOpacity
            onPress={() => setSelectedCat('ALL')}
          >
            <Text
              style={[
                styles.categories,
                selectedCat === 'ALL' && styles.selectedCategory
              ]}

            >
              ALL
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setSelectedCat('LAPTOPS')}
          >
            <Text
              style={[styles.categories,
              selectedCat === 'LAPTOPS' && styles.selectedCategory
              ]}
            >
              LAPTOPS
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setSelectedCat('BEAUTY')}
          >
            <Text
              style={[styles.categories,
              selectedCat === 'BEAUTY' && styles.selectedCategory
              ]}
            >
              BEAUTY
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setSelectedCat('FRAGRANCES')}
          >
            <Text
              style={[styles.categories,
              selectedCat === 'FRAGRANCES' && styles.selectedCategory
              ]}
            >
              FRAGRANCES
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setSelectedCat('FURNITURE')}
          >
            <Text
              style={[styles.categories,
              selectedCat === 'FURNITURES' && styles.selectedCategory
              ]}
            >
              FURNITURES
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View
        style={{
          flex: 50,
          // marginTop: '20%',
        }}
      >
        <FlatList
          data={filteredProducts}
          numColumns={2}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{
            paddingHorizontal: 10,
            paddingBottom: 20,
          }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() =>
                navigation.navigate('DetailScreen', {
                  products: item,
                })
              }
            >

              <Image
                source={{ uri: item.thumbnail }}
                style={styles.productImage}
                resizeMode="cover"
              />
              <Text style={styles.price}>
                ${item.price}
              </Text>
              <Text
                style={styles.title}
                numberOfLines={2}
              >
                {item.title}
              </Text>

              <Text
                style={styles.description}
                numberOfLines={3}
              >
                {item.description}
              </Text>

            </TouchableOpacity>
          )}
        />
      </View>
    </View>
  );
};


const styles = StyleSheet.create({
  categories: {
    paddingHorizontal: 12,
    // borderRadius: 10,
    // borderColor: '#1b1818',
    // borderWidth: 10,
  },
  card: {
    flex: 1,
    backgroundColor: '#fff',
    margin: 6,
    borderRadius: 12,
    padding: 10,
    maxWidth: '50%',

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 5,

    elevation: 5,
  },

  productImage: {
    width: '100%',
    height: 150,
    borderRadius: 10,
  },

  price: {
    marginTop: 10,
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },

  title: {
    marginTop: 5,
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
  },

  description: {
    marginTop: 5,
    fontSize: 15,
    color: '#555',
  },

  selectedCategory: {
    fontWeight: '600',
    paddingHorizontal: 10,
  },
});

export default FlexDirectionBasics;
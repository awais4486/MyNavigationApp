import React from 'react';
import { View, Text, Button, TouchableOpacity } from 'react-native';
import { Platform, StyleSheet, ImageBackground, Alert, TextInput, Image } from 'react-native';

// const HomeScreen = ({ navigation }: { navigation: any }) => {

import { useRef, useState, useEffect } from 'react';
import { ScrollView, FlatList, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// import Ionicons from '@react-native-vector-icons/ionicons/static';
import { Scroll, Search, ShoppingCart } from 'lucide-react-native';
import { addProductToCart } from '../services/authService';
import { useDispatch } from 'react-redux';
import { setCart } from '../components/redux/action';

const STRAPI_URL = 'http://localhost:1337';

const normalizeProduct = (product: any) => {
  const normalizedProduct = product?.attributes
    ? { ...product.attributes, id: product.id, documentId: product.documentId }
    : product;

  if (!normalizedProduct) {
    return null;
  }

  return {
    ...normalizedProduct,
    category: normalizedProduct.category?.data?.attributes
      || normalizedProduct.category?.data
      || normalizedProduct.category,
    image: normalizedProduct.image?.data?.attributes
      || normalizedProduct.image?.data
      || normalizedProduct.image,
  };
};

const normalizeProducts = (data: any) => (
  Array.isArray(data) ? data.map(normalizeProduct).filter(Boolean) : []
);

const getProductImageUrl = (product: any) => {
  const imageUrl = product.image?.url || product.thumbnail;

  if (!imageUrl) {
    return undefined;
  }

  return imageUrl.startsWith('http') ? imageUrl : `${STRAPI_URL}${imageUrl}`;
};

const FlexDirectionBasics = ({ navigation }: { navigation: any }) => {
  const [flexDirection, setflexDirection] = useState('column');
  const [selectedCat, setSelectedCat] = useState('ALL');

  const [searchText, setsearchText] = useState('');

  const screenWidth = Dimensions.get("window").width;

  const [products, setProducts] = useState<any[]>([]);
  const [topRatedProducts, setTopRatedProducts] = useState<any[]>([]);
  const carouselRef = useRef<FlatList<any>>(null);
  const carouselIndex = useRef(0);
  const dispatch = useDispatch();

  useEffect(() => {
    fetchProducts();
    fetchTopRatedProducts();
  }, []);

  useEffect(() => {
    if (topRatedProducts.length < 2) {
      return;
    }

    const interval = setInterval(() => {
      const nextIndex = (carouselIndex.current + 1) % topRatedProducts.length;
      carouselIndex.current = nextIndex;

      carouselRef.current?.scrollToIndex({
        index: nextIndex,
        animated: true,
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [topRatedProducts.length]);

  const fetchProducts = async () => {
    try {
      console.log("fetchProducts() started");

      const response = await fetch(
        `${STRAPI_URL}/api/products?populate[0]=category&populate[1]=image&pagination[page]=1&pagination[pageSize]=200`
      );

      const data = await response.json();

      // Alert.alert("PRODUCT DATA:", JSON.stringify(data, null, 2));

      // Alert.alert(data);

      setProducts(normalizeProducts(data.data));
    } catch (error) {
      console.log("ERROR:", error);
    }
  };

  const fetchTopRatedProducts = async () => {
    try {
      const response = await fetch(
        `${STRAPI_URL}/api/products?sort=rating:desc&populate=image&pagination[pageSize]=5`
      );

      const data = await response.json();

      setTopRatedProducts(normalizeProducts(data.data));
    } catch (error) {
      console.log("TOP RATED PRODUCTS ERROR:", error);
    }
  };

  const searchProducts = async (keyword: string) => {
    try {
      const response = await fetch(
        `${STRAPI_URL}/api/products?filters[title][$containsi]=${encodeURIComponent(keyword)}&populate[0]=category&populate[1]=image&pagination[pageSize]=200`
      );

      const data = await response.json();

      setProducts(normalizeProducts(data.data));
    } catch (error) {
      console.log("SEARCH ERROR:", error);
    }
  };

  const filteredProducts = (products || []).filter((item) => {

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

  const handleAddToCart = async (product: any) => {
    try {
      const updatedCart = await addProductToCart(product);

      if (!updatedCart) {
        Alert.alert('Login Required', 'Please login to use your cart.');
        return;
      }

      dispatch(setCart(updatedCart.cart.items || []));
      Alert.alert('Added to cart', `${product.title} was added to your cart.`);
    } catch (error: any) {
      Alert.alert('Cart error', error.message || 'Could not add this product to your cart.');
    }
  };

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
      <ScrollView>
        <View>
          <FlatList
            data={topRatedProducts}
            ref={carouselRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={{ width: screenWidth }}
                activeOpacity={0.85}
                onPress={() =>
                  navigation.navigate('DetailScreen', {
                    products: item,
                  })
                }
              >
                <Image
                  source={{
                    uri: getProductImageUrl(item),
                  }}
                  style={{
                    width: "100%",
                    height: 220,
                    resizeMode: "cover",
                  }}
                />
              </TouchableOpacity>
            )}
          />
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
                <View style={styles.priceRow}>
                  <Text style={styles.price}>${item.price}</Text>
                  <TouchableOpacity
                    onPress={(event) => {
                      event.stopPropagation();
                      void handleAddToCart(item);
                    }}
                    accessibilityLabel={`Add ${item.title} to cart`}
                    style={styles.cartButton}
                  >
                    <ShoppingCart size={24} color="#80d3d7" />
                  </TouchableOpacity>
                </View>
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
      </ScrollView>
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

  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  cartButton: {
    padding: 6,
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
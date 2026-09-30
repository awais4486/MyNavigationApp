import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Platform, StyleSheet, ImageBackground, Alert, TextInput, Image } from 'react-native';
import { useState, useEffect, } from 'react';
import { ScrollView, FlatList, Pressable, } from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import AsyncStorage from '@react-native-async-storage/async-storage';

import Clipboard from '@react-native-clipboard/clipboard';
import { addProductToCart, getAuthenticatedUser } from '../services/authService';

import { Heart, Minus, Plus } from 'lucide-react-native';
import { useDispatch } from 'react-redux';
import { setCart } from '../components/redux/action';
import { showNotification } from '../services/notifications';

const DetailScreen = ({ route }: { route: any }) => {

  const { products } = route.params;
  const dispatch = useDispatch();
  const [favouriteLoading, setFavouriteLoading] = useState(false);
  const [isFavourite, setIsFavourite] = useState(false);
  const [SelectedImage, setSelectedImage] = useState(products.thumbnail);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    checkFavourite();
  }, []);
  const copyToken = async () => {
    const token = await AsyncStorage.getItem('token');

    if (!token) {
      Alert.alert('Error', 'No token found.');
      return;
    }

    Clipboard.setString(token);

    Alert.alert(
      'Token Copied',
      'The JWT token has been copied to your clipboard.'
    );
  };

  const checkFavourite = async () => {
    try {
      const result = await getAuthenticatedUser();

      if (!result) {
        return;
      }

      const favourites = result.user.favourites || [];

      const alreadyFavourite = favourites.some(
        (item: any) =>
          (item.id !== undefined && item.id === products.id) ||
          (item.documentId !== undefined && item.documentId === products.documentId)
      );

      setIsFavourite(alreadyFavourite);

    } catch (error) {
      console.log('CHECK FAVOURITE ERROR:', error);
    }

  };

  const toggleFavourite = async () => {
    if (favouriteLoading) {
      return;
    }

    try {
      setFavouriteLoading(true);

      const result = await getAuthenticatedUser();

      if (!result) {
        Alert.alert(
          'Login Required',
          'Please login to use favourites.'
        );
        return;
      }

      const { token, user } = result;

      const userId = user.id;
      const productId = products.id;

      console.log('USER ID:', userId);
      console.log('PRODUCT ID:', productId);

      if (typeof productId !== 'number') {
        Alert.alert(
          'Error',
          'Product numeric id is missing.'
        );
        return;
      }

      const relation = isFavourite
        ? {
          disconnect: [productId],
        }
        : {
          connect: [productId],
        };

      const response = await fetch(
        `http://192.168.86.56:1337/api/users/${userId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            favourites: relation,
          }),
        }
      );

      const data = await response.json();

      console.log('FAVOURITE RESPONSE:', data);

      if (!response.ok) {
        console.log('FAVOURITE ERROR:', data);

        Alert.alert(
          'Error',
          data.error?.message || 'Could not update favourite.'
        );

        return;
      }

      setIsFavourite(previous => !previous);

    } catch (error) {
      console.log('TOGGLE FAVOURITE ERROR:', error);

      Alert.alert(
        'Error',
        'Something went wrong while updating favourite.'
      );
    } finally {
      setFavouriteLoading(false);
    }
  };

  const addToCart = async () => {
    try {
      const updatedCart = await addProductToCart(products, quantity);

      if (!updatedCart) {
        Alert.alert('Login Required', 'Please login to use your cart.');
        return;
      }

      dispatch(setCart(updatedCart?.cart.items || []));
      showNotification('Added to cart', `${quantity} x ${products.title} was added to your cart.`);
    } catch (error: any) {
      Alert.alert('Cart error', error.message || 'Could not add this product to your cart.');
    }
  };


  return (

    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      }}>
      <ScrollView style={styles.container}>

        <Image
          source={{ uri: SelectedImage }}
          style={styles.mainImage}
          resizeMode="contain"
        />

        <FlatList
          horizontal
          data={products.images}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity

              onPress={() => setSelectedImage(item)}
            >

              <Image
                source={{ uri: item }}
                style={styles.smallImage}
              />

            </TouchableOpacity>
          )}
        />

        <Text style={styles.rating}>
          Ratings : {products.rating}
        </Text>
        <View
          style={{
            flexDirection: 'row',
            maxWidth: '99%',
            
          }}
        >
          <View>
            <Text style={styles.title}>
              {products.title}
            </Text>
          </View>
          <View
            style={{
              alignItems : 'baseline'
            }}
          >
            <TouchableOpacity
              onPress={() => {
                void toggleFavourite();
              }}
              disabled={favouriteLoading}
            >
              <Heart
                size={30}
                color={isFavourite ? 'red' : 'gray'}
                fill={isFavourite ? 'red' : 'none'}
              />
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.info}>
          Brand : {products.brand}
        </Text>

        <Text style={styles.info}>
          Category : {products.category?.name}
        </Text>

        <Text style={styles.price}>
          ${products.price}
        </Text>

        <Text style={styles.discount}>
          {products.discountPercentage}% OFF
        </Text>

        <Text style={styles.stock}>
          Stock : {products.stock}
        </Text>

        <View style={styles.quantityRow}>
          <Text style={styles.quantityLabel}>Quantity</Text>
          <View style={styles.quantityControls}>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => setQuantity(current => Math.max(1, current - 1))}
              accessibilityLabel="Decrease quantity"
            >
              <Minus size={20} color="#172126" />
            </TouchableOpacity>
            <Text style={styles.quantity}>{quantity}</Text>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => setQuantity(current => Math.min(products.stock, current + 1))}
              accessibilityLabel="Increase quantity"
            >
              <Plus size={20} color="#172126" />
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.heading}>
          Description
        </Text>

        <Text style={styles.description}>
          {products.description}
        </Text>

        <TouchableOpacity style={styles.cartButton} onPress={() => void addToCart()}>
          <Text style={styles.buttonText}>
            Add to Cart
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.buyButton}>
          <Text style={styles.buttonText}>
            Buy Now
          </Text>
        </TouchableOpacity>

      </ScrollView>
    </View>

  );
};

export default DetailScreen;

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#F4F7F8',
    padding: 16,
    marginTop: '10%',
  },

  mainImage: {
    width: '100%',
    height: 300,
    borderRadius: 20,
    backgroundColor: '#fff',
  },

  smallImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginRight: 10,
    marginTop: 15,
    backgroundColor: '#fff',
  },

  rating: {
    fontSize: 18,
    marginTop: 20,
  },

  title: {
    fontSize: 25,
    fontWeight: 'bold',
    marginTop: 8,
    maxWidth: '90%'
  },

  info: {
    fontSize: 18,
    color: '#666',
    marginTop: 5,
  },

  price: {
    fontSize: 34,
    fontWeight: 'bold',
    marginTop: 20,
  },

  discount: {
    fontSize: 18,
    color: 'green',
    marginTop: 5,
  },

  stock: {
    fontSize: 18,
    color: '#444',
    marginTop: 5,
  },

  quantityRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },

  quantityLabel: {
    fontSize: 18,
    fontWeight: '600',
  },

  quantityControls: {
    alignItems: 'center',
    flexDirection: 'row',
  },

  quantityButton: {
    alignItems: 'center',
    borderColor: '#ccd4d7',
    borderRadius: 8,
    borderWidth: 1,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },

  quantity: {
    fontSize: 18,
    fontWeight: '700',
    minWidth: 42,
    textAlign: 'center',
  },

  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 25,
  },

  description: {
    fontSize: 17,
    color: '#555',
    lineHeight: 25,
    marginTop: 10,
  },

  cartButton: {
    backgroundColor: '#FFB300',
    padding: 16,
    borderRadius: 12,
    marginTop: 30,
    alignItems: 'center',
  },

  buyButton: {
    backgroundColor: '#2196F3',
    padding: 16,
    borderRadius: 12,
    marginTop: 15,
    marginBottom: 30,
    alignItems: 'center',
  },

  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },

});



import React from 'react';
import { View, Text, Button, TouchableOpacity } from 'react-native';
import { Platform, StyleSheet, ImageBackground, Alert, TextInput, Image } from 'react-native';

// const HomeScreen = ({ navigation }: { navigation: any }) => {

import { useState, useEffect, } from 'react';
import { ScrollView, FlatList, Pressable, } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';


const DetailScreen = ({ route }: {route: any}) => {

  const { products } = route.params;
  const [ SelectedImage , setSelectedImage ] = useState(products.thumbnail) ;

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
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

        <Text style={styles.title}>
          {products.title}
        </Text>

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

        <Text style={styles.heading}>
          Description
        </Text>

        <Text style={styles.description}>
          {products.description}
        </Text>

        <TouchableOpacity style={styles.cartButton}>
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
    marginTop : '10%',
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
    fontSize: 30,
    fontWeight: 'bold',
    marginTop: 8,
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
import React from 'react';
import { View, Text, Button, TouchableOpacity } from 'react-native';
import { Platform, StyleSheet, ImageBackground, Alert, TextInput, Image } from 'react-native';

// const HomeScreen = ({ navigation }: { navigation: any }) => {

import { useRef, useState, useEffect } from 'react';
import { ScrollView, FlatList, Dimensions, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MultiSlider from '@ptomasroos/react-native-multi-slider';

// import Ionicons from '@react-native-vector-icons/ionicons/static';
import { Scroll, Search, ShoppingCart, SlidersHorizontal, X } from 'lucide-react-native';
import { addProductToCart } from '../services/authService';
import { useDispatch, useSelector } from 'react-redux';
import { addRecentSearch, clearRecentSearches, setCart } from '../components/redux/action';

const STRAPI_URL = 'http://192.168.86.56:1337';

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
  const [sortOrder, setSortOrder] = useState('recommended');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 0]);

  const [searchText, setsearchText] = useState('');

  const screenWidth = Dimensions.get("window").width;

  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showRecentSearches, setShowRecentSearches] = useState(false);

  const [products, setProducts] = useState<any[]>([]);
  const [topRatedProducts, setTopRatedProducts] = useState<any[]>([]);
  const carouselRef = useRef<FlatList<any>>(null);
  const carouselIndex = useRef(0);
  const dispatch = useDispatch();
  const recentSearches = useSelector((state: any) => state.search.recentSearches);

  useEffect(() => {
    fetchProducts();
    fetchTopRatedProducts();
  }, []);

  useEffect(() => {
    if (!products.length) {
      return;
    }

    const prices = products.map((product) => Number(product.price) || 0);
    const lowestPrice = Math.min(...prices);
    const highestPrice = Math.max(...prices);

    setPriceRange((currentRange) => (
      currentRange[0] === 0 && currentRange[1] === 0
        ? [lowestPrice, highestPrice]
        : currentRange
    ));
  }, [products]);

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

    const price = Number(item.price) || 0;
    const matchesPrice = price >= priceRange[0] && price <= priceRange[1];

    return matchesCategory && matchesSearch && matchesPrice;
  }).sort((firstProduct, secondProduct) => {
    if (sortOrder === 'price-low-high') {
      return Number(firstProduct.price) - Number(secondProduct.price);
    }

    if (sortOrder === 'price-high-low') {
      return Number(secondProduct.price) - Number(firstProduct.price);
    }

    return 0;
  });

  const priceValues = products.map((product) => Number(product.price) || 0);
  const priceBounds: [number, number] = priceValues.length
    ? [Math.min(...priceValues), Math.max(...priceValues)]
    : [0, 0];

  const resetFilters = () => {
    setSelectedCat('ALL');
    setSortOrder('recommended');
    setPriceRange(priceBounds);
  };

  const openFilterMenu = () => setShowFilterMenu(true);
  const closeFilterMenu = () => setShowFilterMenu(false);

  const openRecentSearches = () => {
    const search = searchText.trim();

    if (search) {
      dispatch(addRecentSearch(search));
    }

    setShowRecentSearches(true);
  };

  const closeRecentSearches = () => setShowRecentSearches(false);

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
          marginTop: '5%',
          marginLeft: '5%',
        }}
      >
        <Text
          style={{
            fontWeight: '700',
            fontSize: 27,
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
              fontSize: 15,
              padding: 5,
            }}
          />
        </View>
        <View
          style={{
            alignContent: 'flex-start',
            justifyContent: 'flex-start',
            flexDirection: 'row',
          }}
        >
          <TouchableOpacity
            onPress={() => {
              setsearchText('');
              closeRecentSearches();
            }}
            accessibilityLabel="Clear search"
            style={styles.clearSearchButton}
          >
            {(searchText || showRecentSearches) ? <X size={20} color="#555" /> : null}
          </TouchableOpacity> 
          <TouchableOpacity
            onPress={openRecentSearches}
            accessibilityLabel="Show recent searches"
            style={{
              paddingTop: 2,
            }}
          >
            <Search size={25} color={'#80d3d7'} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={openFilterMenu}
            accessibilityLabel="Open product filters"
            style={styles.filterButton}
          >
            <SlidersHorizontal size={25} color={'#80d3d7'} />
          </TouchableOpacity>
        </View>
      </View>
      {showRecentSearches && (
        <View style={styles.recentSearchPanel}>
          <View style={styles.filterHeader}>
            <Text style={styles.filterTitle}>Recent searches</Text>
            <TouchableOpacity
              onPress={closeRecentSearches}
              accessibilityLabel="Close recent searches"
            >
              <X size={22} color="#222" />
            </TouchableOpacity>
          </View>
          {recentSearches.length ? (
            <>
              {recentSearches.map((search: string) => (
                <TouchableOpacity
                  key={search}
                  style={styles.recentSearchOption}
                  onPress={() => {
                    setsearchText(search);
                    closeRecentSearches();
                  }}
                >
                  <Search size={18} color="#555" />
                  <Text style={styles.recentSearchText}>{search}</Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                onPress={() => dispatch(clearRecentSearches())}
                style={styles.clearSearchesButton}
              >
                <Text style={styles.clearSearchesText}>Clear recent searches</Text>
              </TouchableOpacity>
            </>
          ) : (
            <Text style={styles.emptySearchesText}>No recent searches yet.</Text>
          )}
        </View>
      )}
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
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
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
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            paddingHorizontal: 4,
            paddingBottom: 20,
          }}
        >
          {filteredProducts.map((item) => (
              <TouchableOpacity
                key={item.id}
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
          ))}
        </View>
      </ScrollView>
      <Modal
        visible={showFilterMenu}
        transparent
        animationType="slide"
        presentationStyle="overFullScreen"
        statusBarTranslucent
        onRequestClose={closeFilterMenu}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.filterModal}>
            <View style={styles.filterHeader}>
              <Text style={styles.filterTitle}>Filter products</Text>
              <TouchableOpacity
                onPress={closeFilterMenu}
                accessibilityLabel="Close product filters"
              >
                <X size={25} color="#222" />
              </TouchableOpacity>
            </View>
            <Text style={styles.filterSectionTitle}>Category</Text>
            {['ALL', 'LAPTOPS', 'BEAUTY', 'FRAGRANCES', 'FURNITURE'].map((category) => (
              <TouchableOpacity
                key={category}
                style={styles.filterOption}
                onPress={() => {
                  setSelectedCat(category);
                  closeFilterMenu();
                }}
              >
                <Text style={selectedCat === category ? styles.selectedCategory : styles.filterOptionText}>
                  {category === 'ALL' ? 'All products' : category}
                </Text>
              </TouchableOpacity>
            ))}
            <Text style={styles.filterSectionTitle}>Sort by price</Text>
            {[
              ['recommended', 'Recommended'],
              ['price-low-high', 'Price: low to high'],
              ['price-high-low', 'Price: high to low'],
            ].map(([value, label]) => (
              <TouchableOpacity
                key={value}
                style={styles.filterOption}
                onPress={() => setSortOrder(value)}
              >
                <Text style={sortOrder === value ? styles.selectedCategory : styles.filterOptionText}>
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
            <View style={styles.priceFilter}>
              <Text style={styles.filterSectionTitle}>Price range</Text>
              <View style={styles.priceLabels}>
                <Text>${priceRange[0].toFixed(0)}</Text>
                <Text>${priceRange[1].toFixed(0)}</Text>
              </View>
              <MultiSlider
                values={priceRange}
                min={priceBounds[0]}
                max={priceBounds[1] || 1}
                step={1}
                sliderLength={290}
                onValuesChange={(values: number[]) => setPriceRange([values[0], values[1]])}
                selectedStyle={styles.sliderSelected}
                unselectedStyle={styles.sliderUnselected}
                markerStyle={styles.sliderMarker}
                enabledOne={priceBounds[1] > priceBounds[0]}
                enabledTwo={priceBounds[1] > priceBounds[0]}
              />
            </View>
            <View style={styles.filterActions}>
              <TouchableOpacity onPress={resetFilters} style={styles.resetButton}>
                <Text style={styles.resetButtonText}>Reset</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={closeFilterMenu} style={styles.applyButton}>
                <Text style={styles.applyButtonText}>Apply filters</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    width: '48%',
    backgroundColor: '#fff',
    marginVertical: 6,
    borderRadius: 12,
    padding: 10,

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

  filterButton: {
    paddingHorizontal: 8,
    paddingVertical: 5,
  },

  clearSearchButton: {
    minWidth: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  saleBox: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
  },
  filterModal: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
  },
  recentSearchPanel: {
    marginHorizontal: '3%',
    marginTop: 4,
    backgroundColor: '#fff',
    borderRadius: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  filterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  filterTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  filterSectionTitle: {
    marginTop: 12,
    marginBottom: 4,
    fontSize: 16,
    fontWeight: '700',
  },
  filterOption: {
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ccc',
  },
  filterOptionText: {
    fontSize: 17,
  },
  priceFilter: {
    marginTop: 4,
  },
  priceLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sliderSelected: {
    backgroundColor: '#80d3d7',
  },
  sliderUnselected: {
    backgroundColor: '#c6d0d0',
  },
  sliderMarker: {
    backgroundColor: '#80d3d7',
    height: 20,
    width: 20,
  },
  filterActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  resetButton: {
    padding: 12,
  },
  resetButtonText: {
    color: '#333',
    fontWeight: '600',
  },
  applyButton: {
    backgroundColor: '#80d3d7',
    borderRadius: 6,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  applyButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  recentSearchOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 13,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ccc',
  },
  recentSearchText: {
    fontSize: 17,
    color: '#222',
  },
  clearSearchesButton: {
    paddingTop: 16,
    alignItems: 'center',
  },
  clearSearchesText: {
    color: '#b42318',
    fontWeight: '600',
  },
  emptySearchesText: {
    color: '#555',
    fontSize: 16,
    paddingVertical: 12,
  },
});

export default FlexDirectionBasics;
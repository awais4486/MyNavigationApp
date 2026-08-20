import React, { useCallback, useState } from 'react';
import {
	ActivityIndicator,
	FlatList,
	Image,
	RefreshControl,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native';

import { useFocusEffect } from '@react-navigation/native';
import { Heart } from 'lucide-react-native';

import { getAuthenticatedUser } from '../services/authService';

const FavouriteScreen = ({ navigation }: { navigation: any }) => {
	const [favourites, setFavourites] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const [refreshing, setRefreshing] = useState(false);
	const [error, setError] = useState('');

	const loadFavourites = useCallback(async (isRefresh = false) => {
		if (isRefresh) {
			setRefreshing(true);
		} else {
			setLoading(true);
		}

		setError('');

		try {
			const result = await getAuthenticatedUser();

			if (!result) {
				setFavourites([]);
				setError('Please log in to see your favourite products.');
				return;
			}

			setFavourites(Array.isArray(result.user.favourites)
				? result.user.favourites
				: []);
		} catch (loadError) {
			console.log('LOAD FAVOURITES ERROR:', loadError);
			setError('Could not load your favourite products.');
		} finally {
			setLoading(false);
			setRefreshing(false);
		}
	}, []);

	useFocusEffect(
		useCallback(() => {
			void loadFavourites();
		}, [loadFavourites])
	);

	const renderFavourite = ({ item }: { item: any }) => {
		const product = item.attributes || item;

		return (
			<TouchableOpacity
				style={styles.card}
				onPress={() => navigation.navigate('DetailScreen', {
					products: product,
				})}
				activeOpacity={0.8}
			>
				<Image
					source={{ uri: product.thumbnail || product.images?.[0] }}
					style={styles.productImage}
					resizeMode="cover"
				/>
				<View style={styles.cardContent}>
					<View style={styles.titleRow}>
						<Text style={styles.title} numberOfLines={2}>
							{product.title || 'Untitled product'}
						</Text>
						<Heart size={21} color="#e53935" fill="#e53935" />
					</View>
					<Text style={styles.category} numberOfLines={1}>
						{product.category?.name || 'Product'}
					</Text>
					<Text style={styles.price}>
						${product.price ?? '0'}
					</Text>
				</View>
			</TouchableOpacity>
		);
	};

	if (loading) {
		return (
			<View style={styles.centerContent}>
				<ActivityIndicator size="large" color="#e53935" />
				<Text style={styles.statusText}>Loading favourites...</Text>
			</View>
		);
	}

	return (
		<View style={styles.container}>
			<View style={styles.header}>
				<View>
					<Text style={styles.heading}>MY FAVOURITES</Text>
					<Text style={styles.subtitle}>
						{favourites.length} saved {favourites.length === 1 ? 'item' : 'items'}
					</Text>
				</View>
				<Heart size={30} color="#e53935" fill="#e53935" />
			</View>

			{error ? (
				<View style={styles.centerContent}>
					<Text style={styles.errorText}>{error}</Text>
					<TouchableOpacity
						style={styles.retryButton}
						onPress={() => {
							void loadFavourites();
						}}
					>
						<Text style={styles.retryText}>Try again</Text>
					</TouchableOpacity>
				</View>
			) : (
				<FlatList
					data={favourites}
					renderItem={renderFavourite}
					keyExtractor={(item, index) => String(item.id || item.documentId || index)}
					numColumns={2}
					columnWrapperStyle={styles.columnWrapper}
					contentContainerStyle={favourites.length === 0 ? styles.emptyList : styles.list}
					refreshControl={(
						<RefreshControl
							refreshing={refreshing}
							onRefresh={() => {
								void loadFavourites(true);
							}}
							tintColor="#e53935"
						/>
					)}
					ListEmptyComponent={(
						<View style={styles.centerContent}>
							<Heart size={52} color="#b0b8bd" />
							<Text style={styles.emptyTitle}>No favourites yet</Text>
							<Text style={styles.statusText}>
								Products you save will appear here.
							</Text>
						</View>
					)}
				/>
			)}
		</View>
	);
};

export default FavouriteScreen;

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#f4f7f8',
		paddingTop: 55,
	},
	header: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingHorizontal: 18,
		paddingBottom: 18,
	},
	heading: {
		color: '#172126',
		fontSize: 26,
		fontWeight: '800',
	},
	subtitle: {
		color: '#68757a',
		fontSize: 15,
		marginTop: 4,
	},
	list: {
		paddingHorizontal: 10,
		paddingBottom: 24,
	},
	emptyList: {
		flexGrow: 1,
	},
	columnWrapper: {
		justifyContent: 'space-between',
	},
	card: {
		width: '48%',
		backgroundColor: '#fff',
		borderRadius: 12,
		marginBottom: 14,
		overflow: 'hidden',
	},
	productImage: {
		width: '100%',
		height: 150,
		backgroundColor: '#e8edef',
	},
	cardContent: {
		padding: 10,
	},
	titleRow: {
		flexDirection: 'row',
		alignItems: 'flex-start',
		justifyContent: 'space-between',
		gap: 6,
	},
	title: {
		flex: 1,
		color: '#172126',
		fontSize: 16,
		fontWeight: '700',
	},
	category: {
		color: '#7a8589',
		fontSize: 13,
		marginTop: 7,
	},
	price: {
		color: '#172126',
		fontSize: 18,
		fontWeight: '800',
		marginTop: 8,
	},
	centerContent: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		padding: 24,
	},
	statusText: {
		color: '#68757a',
		fontSize: 15,
		marginTop: 10,
		textAlign: 'center',
	},
	emptyTitle: {
		color: '#172126',
		fontSize: 20,
		fontWeight: '700',
		marginTop: 16,
	},
	errorText: {
		color: '#c62828',
		fontSize: 16,
		textAlign: 'center',
	},
	retryButton: {
		backgroundColor: '#172126',
		borderRadius: 8,
		marginTop: 16,
		paddingHorizontal: 18,
		paddingVertical: 11,
	},
	retryText: {
		color: '#fff',
		fontSize: 15,
		fontWeight: '700',
	},
});

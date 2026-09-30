import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { ArrowLeft, Check, RotateCcw, RotateCw } from 'lucide-react-native';
import { loadImage, NitroImage, type Image as NitroImageType } from 'react-native-nitro-image';

const cropRatios = [
  { label: '1:1', value: 1 },
  { label: '4:5', value: 4 / 5 },
  { label: '4:3', value: 4 / 3 },
];

const ProfilePictureEditorScreen = ({ navigation, route }: { navigation: any; route: any }) => {
  const { imageUri } = route.params as { imageUri: string };
  const { width: windowWidth } = useWindowDimensions();
  const [image, setImage] = useState<NitroImageType | null>(null);
  const [cropRatio, setCropRatio] = useState(1); 
  const [isSaving, setIsSaving] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const previewWidth = Math.min(windowWidth - 40, 340);

  useEffect(() => {
    let isMounted = true;

    const imageSource = imageUri.startsWith('http')
      ? { url: imageUri }
      : { filePath: imageUri };

    Promise.resolve(loadImage(imageSource)).then((loadedImage) => {
      if (isMounted) {
        setImage(loadedImage);
      }
    }).catch(() => {
      if (isMounted) {
        setLoadError(true);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [imageUri]);

  const rotate = async (degrees: number) => {
    if (!image) {
      return;
    }

    try {
      setImage(await image.rotateAsync(degrees));
    } catch {
      Alert.alert('Could not rotate image', 'Please try selecting the photo again.');
    }
  };

  const saveImage = async () => {
    if (!image) {
      return;
    }

    setIsSaving(true);
    try {
      const imageRatio = image.width / image.height;
      const cropWidth = imageRatio > cropRatio ? image.height * cropRatio : image.width;
      const cropHeight = imageRatio > cropRatio ? image.height : image.width / cropRatio;
      const left = (image.width - cropWidth) / 2;
      const top = (image.height - cropHeight) / 2;
      const croppedImage = await image.cropAsync(left, top, left + cropWidth, top + cropHeight);
      const path = await croppedImage.saveToTemporaryFileAsync('jpg', 90);

      navigation.navigate('Home', {
        screen: 'ProfileScreen',
        params: { editedImageUri: `file://${path}` },
      });
    } catch {
      Alert.alert('Could not save image', 'Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const previewHeight = previewWidth / cropRatio;

  return (
    <View style={styles.screen}> 
      <View style={styles.header}>
        <Pressable accessibilityRole="button" accessibilityLabel="Cancel editing" onPress={() => navigation.goBack()} style={styles.iconButton}>
          <ArrowLeft size={22} color="#172a2a" />
        </Pressable>
        <Text style={styles.title}>Edit profile photo</Text>
        <View style={styles.iconButton} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.instruction}>Adjust your photo before saving</Text>

        <View style={[styles.previewFrame, { width: previewWidth, height: previewHeight }]}>
          {image ? (
            <NitroImage image={image} resizeMode="cover" style={styles.previewImage} />
          ) : loadError ? (
            <Text style={styles.errorText}>This photo could not be opened.</Text>
          ) : (
            <ActivityIndicator color="#168b83" />
          )}
        </View>

        <Text style={styles.sectionLabel}>CROP</Text>
        <View style={styles.ratioOptions}>
          {cropRatios.map((ratio) => (
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ selected: cropRatio === ratio.value }}
              key={ratio.label}
              onPress={() => setCropRatio(ratio.value)}
              style={[styles.ratioButton, cropRatio === ratio.value && styles.selectedRatioButton]}
            >
              <Text style={[styles.ratioText, cropRatio === ratio.value && styles.selectedRatioText]}>{ratio.label}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.sectionLabel}>ROTATE</Text>
        <View style={styles.rotationOptions}>
          <Pressable accessibilityRole="button" accessibilityLabel="Rotate left" onPress={() => rotate(-90)} style={styles.rotateButton}>
            <RotateCcw size={20} color="#172a2a" />
            <Text style={styles.rotateText}>Left</Text>
          </Pressable>
          <Pressable accessibilityRole="button" accessibilityLabel="Rotate right" onPress={() => rotate(90)} style={styles.rotateButton}>
            <RotateCw size={20} color="#172a2a" />
            <Text style={styles.rotateText}>Right</Text>
          </Pressable>
        </View>

        <Pressable
          accessibilityRole="button"
          disabled={!image || isSaving || loadError}
          onPress={() => saveImage()}
          style={[styles.saveButton, (!image || isSaving || loadError) && styles.disabledButton]}
        >
          {isSaving ? <ActivityIndicator color="#ffffff" /> : <Check size={20} color="#ffffff" />}
          <Text style={styles.saveText}>{isSaving ? 'Saving...' : 'Use this photo'}</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f2f6f4',
  },
  header: {
    minHeight: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  iconButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: '#172a2a',
    fontSize: 18,
    fontWeight: '700',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 28,
  },
  instruction: {
    alignSelf: 'flex-start',
    marginTop: 8,
    marginBottom: 18,
    color: '#566765',
    fontSize: 15,
  },
  previewFrame: {
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: '#dce6e2',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  errorText: {
    padding: 16,
    color: '#9b2c2c',
    textAlign: 'center',
  },
  sectionLabel: {
    alignSelf: 'flex-start',
    marginTop: 24,
    marginBottom: 10,
    color: '#60716e',
    fontSize: 12,
    fontWeight: '700',
  },
  ratioOptions: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    gap: 10,
  },
  ratioButton: {
    minWidth: 68,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#c6d2ce',
    borderRadius: 8,
    backgroundColor: '#ffffff',
  },
  selectedRatioButton: {
    borderColor: '#168b83',
    backgroundColor: '#dff3ef',
  },
  ratioText: {
    color: '#394c49',
    fontSize: 14,
    fontWeight: '600',
  },
  selectedRatioText: {
    color: '#08746d',
  },
  rotationOptions: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    gap: 12,
  },
  rotateButton: {
    flex: 1,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#c6d2ce',
    borderRadius: 8,
    backgroundColor: '#ffffff',
  },
  rotateText: {
    color: '#243633',
    fontSize: 14,
    fontWeight: '600',
  },
  saveButton: {
    alignSelf: 'stretch',
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 28,
    borderRadius: 8,
    backgroundColor: '#168b83',
  },
  disabledButton: {
    opacity: 0.55,
  },
  saveText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default ProfilePictureEditorScreen;
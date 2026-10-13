import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { Camera as FaceCamera, type Face } from 'react-native-vision-camera-face-detector';
import { useCameraDevice, useCameraPermission, usePhotoOutput } from 'react-native-vision-camera';
import { ArrowLeft, Camera as CameraIcon } from 'lucide-react-native';

const ProfileCameraScreen = ({ navigation }: { navigation: any }) => {
  const isFocused = useIsFocused();
  const device = useCameraDevice('front');
  const { hasPermission, canRequestPermission, requestPermission } = useCameraPermission();
  const { width, height } = useWindowDimensions();
  const [faceCount, setFaceCount] = useState(0);
  const [isFaceCentered, setIsFaceCentered] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const photoOutput = usePhotoOutput({ containerFormat: 'jpeg' });

  useEffect(() => {
    if (!hasPermission && canRequestPermission) {
      requestPermission().catch(() => {
        Alert.alert('Camera permission unavailable', 'Please try again or enable camera access in Settings.');
      });
    }
  }, [canRequestPermission, hasPermission, requestPermission]);

  const handleFacesDetected = useCallback((faces: Face[]) => {
    setFaceCount((currentCount) => currentCount === faces.length ? currentCount : faces.length);
    const face = faces.length === 1 ? faces[0] : undefined;
    const centerX = face ? face.bounds.x + face.bounds.width / 2 : 0;
    const centerY = face ? face.bounds.y + face.bounds.height / 2 : 0;
    const normalizedX = (centerX - width / 2) / 125;
    const normalizedY = (centerY - (height * 0.24 + 165)) / 165;
    const isCentered = Boolean(face) && normalizedX ** 2 + normalizedY ** 2 <= 1;

    setIsFaceCentered((currentValue) => currentValue === isCentered ? currentValue : isCentered);
  }, [height, width]);

  const capturePhoto = async () => {
    if (faceCount !== 1 || !isFaceCentered || isCapturing) {
      return;
    }

    setIsCapturing(true);
    try {
      const photo = await photoOutput.capturePhotoToFile({ flashMode: 'off' }, {});
      navigation.navigate('ProfilePictureEditor', { imageUri: photo.filePath });
    } catch {
      Alert.alert('Could not take photo', 'Please try again.');
    } finally {
      setIsCapturing(false);
    }
  };

  const guidance = faceCount === 1
    ? isFaceCentered ? 'Face detected. Ready to capture.' : 'Center your face inside the guide.'
    : faceCount > 1
      ? 'Only one person should be in the frame.'
      : 'Position your face inside the frame.';

  return (
    <View style={styles.screen}>
      {hasPermission && device ? (
        <FaceCamera
          style={StyleSheet.absoluteFill}
          device={device}
          isActive={isFocused}
          cameraFacing="front"
          autoMode
          performanceMode="fast"
          minFaceSize={0.15}
          onFacesDetected={handleFacesDetected}
          onError={() => Alert.alert('Camera error', 'Face detection is unavailable. Please try again.')}
          outputs={[photoOutput]}
        />
      ) : (
        <View style={styles.cameraFallback}>
          {!hasPermission && canRequestPermission ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.permissionMessage}>
              {!hasPermission ? 'Allow camera access in Settings to take a profile photo.' : 'No front camera is available.'}
            </Text>
          )}
        </View>
      )}

      <View style={styles.topBar}>
        <Pressable accessibilityRole="button" accessibilityLabel="Close camera" onPress={() => navigation.goBack()} style={styles.iconButton}>
          <ArrowLeft size={22} color="#ffffff" />
        </Pressable>
        <Text style={styles.title}>Take profile photo</Text>
        <View style={styles.iconButton} />
      </View>

      {hasPermission && device ? (
        <View pointerEvents="none" style={styles.faceGuideArea}>
          <View style={[styles.faceGuide, faceCount === 1 && isFaceCentered && styles.faceGuideReady]} />
        </View>
      ) : null}

      <View style={styles.bottomBar}>
        <Text style={styles.hint}>{guidance}</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Capture profile photo"
          accessibilityState={{ disabled: faceCount !== 1 || !isFaceCentered || isCapturing || !hasPermission }}
          disabled={faceCount !== 1 || !isFaceCentered || isCapturing || !hasPermission}
          onPress={capturePhoto}
          style={[styles.captureButton, (faceCount !== 1 || !isFaceCentered || isCapturing || !hasPermission) && styles.captureButtonDisabled]}
        >
          {isCapturing ? <ActivityIndicator color="#ffffff" /> : <CameraIcon size={25} color="#ffffff" />}
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: 'space-between',
    backgroundColor: '#101716',
  },
  cameraFallback: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    backgroundColor: '#101716',
  },
  permissionMessage: {
    color: '#ffffff',
    fontSize: 16,
    textAlign: 'center',
  },
  topBar: {
    zIndex: 1,
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: '#10171699',
  },
  iconButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '700',
  },
  faceGuideArea: {
    position: 'absolute',
    top: '24%',
    right: 0,
    left: 0,
    alignItems: 'center',
  },
  faceGuide: {
    width: 250,
    height: 330,
    borderWidth: 2,
    borderColor: '#ffffffaa',
    borderRadius: 130,
  },
  faceGuideReady: {
    borderColor: '#60e6b2',
  },
  bottomBar: {
    zIndex: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 36,
    backgroundColor: '#101716cc',
  },
  hint: {
    marginBottom: 18,
    color: '#ffffff',
    fontSize: 14,
    textAlign: 'center',
  },
  captureButton: {
    width: 68,
    height: 68,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#ffffff',
    borderRadius: 34,
    backgroundColor: '#168b83',
  },
  captureButtonDisabled: {
    opacity: 0.45,
  },
});

export default ProfileCameraScreen;
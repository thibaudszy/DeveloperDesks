import React, { useState, useEffect, useCallback } from "react";
import { Image, Alert, View, Text, StyleSheet, Dimensions } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { ImageInfo } from "expo-image-picker/build/ImagePicker.types";

import { useAsyncCallback } from "app/lib/useAsyncCallback";
import { HugeButton, Button, CameraIcon, GalleryIcon, theme } from "app/ui";

export function AddDeskScreen() {
  const [image, setImage] = useState<ImageInfo>();

  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestCameraRollPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Sorry, we need camera roll permissions to make this work!"
        );
      }
    })();
  }, []);

  const launchCamera = useCallback(async () => {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.85,
    });
    if (!result.cancelled) {
      setImage(result);
    }
  }, [setImage]);

  const launchGallery = useCallback(async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.85,
    });
    if (!result.cancelled) {
      setImage(result);
    }
  }, [setImage]);

  const [startUpload, uploadState] = useAsyncCallback(async () => {
    if (!image) return;

    const body = new FormData();
    body.append("upload_preset", "k8vaf22u");
    const cloudname = "daxjf54p3";
    body.append("file", {
      uri: image.uri,
      type: "image/jpg",
      name: Date.now() + ".jpg",
    } as any);

    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudname}/image/upload`,
        {
          method: "post",
          body: body,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      const data = await res.json();
      console.log(data);
    } catch (err) {
      console.error(err);
      Alert.alert("Oh no! An error occurred...");
    }
  });

  const width = Dimensions.get("window").width - 2 * 16;
  const imageSizing = {
    width,
    height: width * (2 / 3),
  };

  return (
    <View style={styles.screen}>
      <View style={styles.uploadButtonsRow}>
        <View style={{ flex: 1, padding: 8 }}>
          <HugeButton
            text="Take a photo"
            Icon={CameraIcon}
            onPress={launchCamera}
          />
        </View>
        <View style={{ flex: 1, padding: 8 }}>
          <HugeButton
            text="Select from gallery"
            Icon={GalleryIcon}
            onPress={launchGallery}
          />
        </View>
      </View>
      {!image ? (
        <View style={{ flex: 1 }} key="upload_todo">
          <View style={{ flex: 1 }} />
          <Text style={styles.emptyStateText}>
            Select a photo from your gallery, or take a photo, to continue.
          </Text>
          <View style={{ flex: 1.6 }} />
        </View>
      ) : (
        <View style={{ flex: 1 }} key="upload">
          <Image source={{ uri: image.uri }} style={imageSizing} />
          <View style={{ flex: 1 }} />
          <Button
            disabled={uploadState.status === "loading"}
            text="Upload this image!"
            onPress={startUpload}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: theme.colors.background,
  },
  uploadButtonsRow: {
    flexDirection: "row",
    marginHorizontal: -8,
    marginTop: -8,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    lineHeight: 1.35 * 16,
    color: theme.colors.muted,
    marginHorizontal: 16,
  },
});

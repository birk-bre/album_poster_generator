"use client";

import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  Font,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 24,
    flexDirection: "column",
    backgroundColor: "#E8E4D9",
  },
  image: {
    width: "100%",
    height: undefined,
    aspectRatio: 1,
    marginBottom: 10,
    marginLeft: "auto",
    marginRight: "auto",
  },
  songList: {
    flexGrow: 1,
    marginBottom: 10,
  },
  song: {
    fontSize: 12,
    fontWeight: "extrabold",
    textTransform: "uppercase",
  },
});

Font.register({
  family: "Oswald-light",
  src: "/fonts/Oswald-Light.ttf",
});

Font.register({
  family: "Oswald-bold",
  src: "/fonts/Oswald-Bold.ttf",
});

Font.register({
  family: "Oswald-regular",
  src: "/fonts/Oswald-Regular.ttf",
});

export default function PDF({
  imageSrc,
  category,
  songs,
  colors,
  albumName,
  artistName,
  length,
  release_date,
  label,
}: {
  release_date: string;
  albumName: string;
  artistName: string;
  length: string;
  label: string;
  imageSrc: string;
  category: string;
  songs: string[];
  colors: {
    r: number;
    g: number;
    b: number;
  }[];
}) {
  return (
    <Document style={{ fontFamily: "Oswald-bold" }}>
      <Page style={styles.page} size="A4" wrap={false}>
        <Image src={imageSrc} style={styles.image} />

        <View style={{ display: "flex", flexDirection: "row", flex: 1 }}>
          <View
            style={{
              display: "flex",
              flexBasis: "50%",
              justifyContent: "space-between",
            }}
          >
            {/* Track listing */}
            <View style={{ display: "flex", gap: "-2px" }}>
              {songs.map((song, index) => (
                <Text key={index} style={styles.song}>
                  {index + 1}. {song}
                </Text>
              ))}
            </View>

            <View style={{ marginTop: 24 }}>
              <Text
                style={{
                  fontFamily: "Oswald-light",
                  fontSize: 10,
                  textTransform: "uppercase",
                }}
              >
                {length} / {release_date}
              </Text>
              <Text
                style={{
                  fontFamily: "Oswald-light",
                  fontSize: 10,
                  textTransform: "uppercase",
                }}
              >
                RELEASED BY {label}
              </Text>
            </View>
          </View>
          <View style={{ display: "flex", flexBasis: "50%" }}>
            <View
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-end",
                flex: 1,
                padding: 12,
              }}
            >
              <View style={{ display: "flex", alignItems: "flex-end" }}>
                <View
                  style={{ display: "flex", flexDirection: "row", gap: 8 }}
                >
                  {colors.map((color, index) => (
                    <View
                      key={index}
                      style={{
                        width: 26,
                        height: 26,
                        backgroundColor: `rgb(${color.r}, ${color.g}, ${color.b})`,
                      }}
                    />
                  ))}
                </View>
                <Text
                  style={{
                    fontSize: 10,
                    paddingTop: 12,
                    fontFamily: "Oswald-light",
                  }}
                >
                  {category}
                </Text>
              </View>

              <View
                style={{
                  textTransform: "uppercase",
                  display: "flex",
                  alignItems: "flex-end",
                }}
              >
                <Text style={{ fontSize: 18, fontFamily: "Oswald-regular" }}>
                  {artistName}
                </Text>
                <Text style={{ fontSize: 32 }}>{albumName}</Text>
              </View>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
}

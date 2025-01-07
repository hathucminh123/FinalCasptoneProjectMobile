import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from "react-native";
import { Checkbox } from "react-native-paper";
import { useQuery } from "@tanstack/react-query";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { GetUserProfile } from "../../Services/UserProfileService/UserProfile";

interface ServiceProps {
  setSelectServiceId: (id: number) => void;
}

export default function ServiceSelection({ setSelectServiceId }: ServiceProps) {
  const [selectedCard, setSelectedCard] = useState<number | null>(null);
  const [UserId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserId = async () => {
      const id = await AsyncStorage.getItem("userId");
      setUserId(id);
    };

    fetchUserId();
  }, []);

  const { data: UserProfile } = useQuery({
    queryKey: ["UserProfile"],
    queryFn: ({ signal }) =>
      GetUserProfile({ id: Number(UserId), signal: signal }),
    staleTime: 1000,
    enabled: !!UserId,
  });

  const UserProfileData = UserProfile?.UserProfiles;

  const handleSelectCard = (id: number) => {
    setSelectedCard(id);
    setSelectServiceId(id);
  };

  const renderCard = ({ item }: any) => {
    const isSelected = selectedCard === item.serviceResponse.id;
    return (
      <TouchableOpacity
        style={[styles.card, isSelected && styles.selectedCard]}
        onPress={() => handleSelectCard(item.serviceResponse.id)}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{item.serviceResponse.name}</Text>
          <Checkbox
            status={isSelected ? "checked" : "unchecked"}
            onPress={() => handleSelectCard(item.serviceResponse.id)}
          />
        </View>
        <Text style={styles.cardDescription}>
          {item.serviceResponse.description}
        </Text>
        <View style={styles.cardFooter}>
          <Text style={styles.cardInfo}>
            Number of Posts Left: {item.numberOfPostsLeft}
          </Text>
          <Text style={styles.cardInfo}>
            Price: {item.serviceResponse.price.toLocaleString()} VND
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select a Service</Text>
      {UserProfileData?.userAccountServices && UserProfileData?.userAccountServices?.length > 0 ? (
        <FlatList
          data={UserProfileData?.userAccountServices}
          renderItem={renderCard}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.list}
        />
      ) : (
        <View style={styles.noServiceContainer}>
          <Text style={styles.noServiceText}>No Service Package</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f9f9f9",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  list: {
    paddingBottom: 16,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  selectedCard: {
    borderWidth: 2,
    borderColor: "#ff4500",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  cardDescription: {
    fontSize: 14,
    color: "#555",
    marginBottom: 8,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cardInfo: {
    fontSize: 14,
    color: "#333",
  },
  noServiceContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noServiceText: {
    fontSize: 18,
    color: "#777",
  },
});

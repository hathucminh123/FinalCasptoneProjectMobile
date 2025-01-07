import React, { useState } from "react";
import { View, Text, TextInput, Button, FlatList, Alert, TouchableOpacity, StyleSheet } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { Rating } from "react-native-ratings";
import { useMutation, useQuery } from "@tanstack/react-query";
import { GetCommentByJobActivity } from "../../Services/JobActivityComment/GetCommentByJobActivity";
import { PutJobActivityComment } from "../../Services/JobActivityComment/PutJobActivityComment";
import { DeleteJobActivityComment } from "../../Services/JobActivityComment/DeleteJobActivityComment";
import { queryClient } from "../../Services/mainService";
// import HeaderSystem from "../../components/Employer/HeaderSystem";
import Icon from "react-native-vector-icons/MaterialIcons";

interface Comment {
  id: number;
  commentText: string;
  commentDate: string;
  rating: number;
}

export default function CommentScreen({route,navigation}:any) {
//   const route = useRoute();
//   const navigation = useNavigation();
  const commentId = route.params?.commentId;
  const currentPage = route.params?.page || 1;

  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editedCommentText, setEditedCommentText] = useState<string>("");
  const [editedRating, setEditedRating] = useState<number | null>(null);

  const { mutate: PutComment } = useMutation({
    mutationFn: PutJobActivityComment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["SeekerApply"], refetchType: "active" });
      queryClient.invalidateQueries({ queryKey: ["Comment"], refetchType: "active" });
      Alert.alert("Success", "Comment and rating updated successfully!");
      setEditingCommentId(null);
    },
    onError: () => {
      Alert.alert("Error", "Failed to update the comment.");
    },
  });

  const { mutate: DeleteComment } = useMutation({
    mutationFn: DeleteJobActivityComment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["SeekerApply"], refetchType: "active" });
      queryClient.invalidateQueries({ queryKey: ["Comment"], refetchType: "active" });
      Alert.alert("Success", "Comment deleted successfully!");
    },
    onError: () => {
      Alert.alert("Error", "Failed to delete the comment.");
    },
  });

  const { data: Comment, isLoading, isError } = useQuery({
    queryKey: ["Comment", commentId],
    queryFn: ({ signal }) => GetCommentByJobActivity({ signal, id: Number(commentId) }),
    enabled: !!commentId,
    staleTime: 5000,
  });

  if (isLoading) {
    return <Text>Loading...</Text>;
  }

  if (isError || !Comment) {
    return <Text>Error loading comments. Please try again later.</Text>;
  }

  const CommentsData = Comment?.pagination.items || [];
  const Navigate = Comment?.pagination.pageSize;
  const totalPages = Math.ceil(CommentsData.length / Navigate);

  const currentNotifications = CommentsData.slice(
    (currentPage - 1) * Navigate,
    currentPage * Navigate
  );

  const handleEdit = (comment: Comment) => {
    setEditingCommentId(comment.id);
    setEditedCommentText(comment.commentText);
    setEditedRating(comment.rating);
  };

  const handleSave = (commentId: number) => {
    PutComment({
      data: {
        commentText: editedCommentText,
        rating: editedRating,
        id: commentId,
        commentDate: new Date().toISOString(),
      },
    });
  };

  const handleDelete = (commentId: number) => {
    DeleteComment({ id: commentId });
  };

  const renderNotification = ({ item }: { item: Comment }) => (
    <View style={styles.commentContainer}>
      <View style={styles.commentHeader}>
        <Text style={styles.commentTitle}>Comment</Text>
        <Text>{new Date(item.commentDate).toLocaleDateString()}</Text>
      </View>
      <View style={styles.commentContent}>
        {editingCommentId === item.id ? (
          <>
            <TextInput
              style={styles.input}
              value={editedCommentText}
              onChangeText={setEditedCommentText}
              placeholder="Edit your comment"
            />
            <Rating
              type="star"
              startingValue={editedRating || 0}
              imageSize={20}
              onFinishRating={(rating:number) => setEditedRating(rating)}
            />
            <TouchableOpacity onPress={() => handleSave(item.id)}>
              <Icon name="save" size={24} color="#4CAF50" />
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text>{item.commentText}</Text>
            <Rating readonly startingValue={item.rating || 0} imageSize={20} />
          </>
        )}
      </View>
      <View style={styles.commentActions}>
        <TouchableOpacity onPress={() => handleEdit(item)}>
          <Icon name="edit" size={24} color="#FFC107" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDelete(item.id)}>
          <Icon name="delete" size={24} color="#F44336" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* <HeaderSystem title="Comment" appear={true} /> */}
      <FlatList
        data={currentNotifications}
        renderItem={renderNotification}
        keyExtractor={(item) => item.id.toString()}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
      <View style={styles.paginationContainer}>
        {[...Array(totalPages).keys()].map((_, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => navigation.navigate("CommentScreen", { page: index + 1 })}
            style={[styles.pageNumber, currentPage === index + 1 && styles.activePage]}
          >
            <Text style={styles.pageText}>{index + 1}</Text>
          </TouchableOpacity>
        ))}
        {currentPage < totalPages && (
          <TouchableOpacity
            onPress={() => navigation.navigate("CommentScreen", { page: currentPage + 1 })}
            style={styles.pageNext}
          >
            <Icon name="navigate-next" size={16} color="#007bff" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  commentContainer: {
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 8,
    marginBottom: 8,
  },
  commentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  commentTitle: {
    fontWeight: "bold",
  },
  commentContent: {
    marginVertical: 8,
  },
  input: {
    borderColor: "#ddd",
    borderWidth: 1,
    padding: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  commentActions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
  },
  pageNumber: {
    padding: 8,
    marginHorizontal: 4,
    borderRadius: 4,
  },
  activePage: {
    backgroundColor: "#007bff",
  },
  pageText: {
    color: "#007bff",
  },
  pageNext: {
    paddingHorizontal: 8,
  },
  separator: {
    height: 1,
    backgroundColor: "#ddd",
    marginVertical: 8,
  },
});


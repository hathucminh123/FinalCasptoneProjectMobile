import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

export default function MainHeader({ navigation }: { navigation: any }) {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = () => {
    if (searchQuery.trim() !== '') {
      // Navigate to the search results page with the search query as a parameter
      navigation.navigate('SearchResults', { query: searchQuery });
    } else {
      alert('Please enter a search query');
    }
  };
  const NavigateSearch =()=>{
    navigation.navigate('FormSearch')
  }

  const handleNavigate =()=>{
    navigation.navigate('Notification');
  }

  return (
    <>
      <View style={styles.container}>
        {/* Top bar with menu and bell icons */}
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.iconButton} onPress={() => navigation.openDrawer()}>
            <Icon name="bars" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.text}>Amazing Jobs</Text>
          {/* <TouchableOpacity style={styles.iconButton} onPress={handleNavigate}>
            <Icon name="bell" size={24} color="#fff" />
          </TouchableOpacity> */}
        </View>
      </View>

      {/* Search bar */}
      <View style={styles.searchContainer}>
        <View style={styles.search}>
          <Icon name="search" size={16} color="black" style={styles.searchIcon} />
          <TouchableOpacity onPress={NavigateSearch} style={styles.searchInput} >
          <TextInput
            // style={styles.searchInput}
            placeholder="Type keyword to search."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            editable={false}
             // Call handleSearch when the user submits the search
          />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleSearch}>
            <Icon name="arrow-right" size={20} color="black" />
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FF4500',
    paddingVertical: 30,
    paddingHorizontal: 10,
  
    height: 100,
  },
  text: {
    color: 'white',
    fontSize: 20,
    fontWeight: '900',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconButton: {
    padding: 10, // Increases the touch area
  },
  searchContainer: {
    marginTop: -20, 
    paddingHorizontal: 10,
    zIndex:1000,
  },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    paddingHorizontal: 10,
    height: 40,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 10,
 
    
  },
});

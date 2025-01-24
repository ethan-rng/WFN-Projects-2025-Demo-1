import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';

const ProfileScreen = () => {
  const profileDetails = [
    { title: 'Edit Profile', key: '1' },
    { title: 'Languages', key: '2' },
    { title: 'History', key: '3' },
    { title: 'Settings', key: '4' },
    { title: 'Log Out', key: '5' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.profileInfoContainer}>
        <View style={styles.profileDetails}>
          <Text style={styles.detailText}>Name: Brianna</Text>
          <Text style={styles.detailText}>Age: 18</Text>
          <Text style={styles.detailText}>Favourite colour: Purple</Text>
        </View>
      </View>

      <FlatList
        data={profileDetails}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.optionContainer}>
            <Text style={styles.optionText}>{item.title}</Text>
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item.key}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  profileInfoContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  profileDetails: {
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
  },
  detailText: {
    fontSize: 16,
    color: 'black',
    marginVertical: 2,
  },
  optionContainer: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  optionText: {
    fontSize: 16,
    color: 'black',
  },
});

export default ProfileScreen;

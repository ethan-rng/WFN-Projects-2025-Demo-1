import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Alert, Button, StyleSheet } from 'react-native';
import { recipeService } from '../src/recipeService';
import { auth } from '../firebaseConfig'; // Import your Firebase Auth configuration

export default function HistoryScreen() {
  const [recipes, setRecipes] = useState<Array<{
    id: string;
    title: string;
    ingredients: string[];
    instructions: string;
  }>>([]);
  const [loading, setLoading] = useState(false);

  // Grabs the user from Firebase Auth
  const currentUser = auth.currentUser;

  // Function to fetch recipes by user ID
  const fetchRecipes = async () => {
    try {
      if (!currentUser) {
        Alert.alert('Not logged in', 'No user is currently logged in');
        return;
      }
      setLoading(true);
      const response = await recipeService.getRecipes(currentUser.uid);

      if (response.success) {
        setRecipes(response.recipes);
      } else {
        Alert.alert('Error', response.error || 'Failed to retrieve recipes.');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred while fetching recipes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecipes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recipe History</Text>

      {loading ? (
        <Text>Loading...</Text>
      ) : (
        <FlatList
          data={recipes}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.itemContainer}>
              <Text style={styles.itemTitle}>{item.title}</Text>
              <Text>Ingredients: {item.ingredients.join(', ')}</Text>
              <Text>Instructions: {item.instructions}</Text>
            </View>
          )}
        />
      )}

      <Button title="Refresh" onPress={fetchRecipes} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  itemContainer: {
    marginVertical: 10,
  },
  itemTitle: {
    fontWeight: 'bold',
  },
});

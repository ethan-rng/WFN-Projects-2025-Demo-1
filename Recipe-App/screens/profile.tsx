import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  Image,
  FlatList,
  Dimensions,
  Modal,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { auth, firestore } from '../firebaseConfig';
import {
  collection,
  getDocs,
  query,
  where,
  DocumentData,
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import * as ImagePicker from 'expo-image-picker';
import { uploadImage } from '../services/imageService';

interface UserInfo {
  name: string;
  age?: string;
  pronouns?: string;
  profileImage?: string;
  bannerImage?: string; // BANNER CODE ADDED
  followersCount?: number;
  followingCount?: number;
}

type RootStackParamList = {
  Login: undefined;
  SignUp: undefined;
  Main: undefined;
  Caption: { imageUri: string };
  BigPost: { posts: DocumentData[]; initialIndex: number };
  BigRecipe: { recipe: DocumentData };
};

const screenWidth = Dimensions.get('window').width;

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [userInfo, setUserInfo] = useState<UserInfo>({
    name: '',
    pronouns: '',
    followersCount: 0,
    followingCount: 0,
  });
  const [posts, setPosts] = useState<DocumentData[]>([]);
  const [savedRecipes, setSavedRecipes] = useState<DocumentData[]>([]);
  const [selectedTab, setSelectedTab] = useState<'posts' | 'saved'>('posts');
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPronouns, setEditPronouns] = useState('');
  const [editProfileImage, setEditProfileImage] = useState<string | null>(null);
  const [editBannerImage, setEditBannerImage] = useState<string | null>(null); // BANNER CODE ADDED
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Fetch user info
  const fetchUserInfo = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;
    try {
      const userRef = doc(firestore, 'users', currentUser.uid);
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setUserInfo({
          name: userData.name || '',
          pronouns: userData.pronouns || '',
          profileImage: userData.profileImage || undefined,
          bannerImage: userData.bannerImage || undefined, // BANNER CODE ADDED
          followersCount: userData.followersCount || 0,
          followingCount: userData.followingCount || 0,
        });
      } else {
        // If user doc doesn't exist, create it
        await setDoc(userRef, {
          name: currentUser.displayName || 'New User',
          pronouns: '',
          profileImage: undefined,
          bannerImage: undefined, // BANNER CODE ADDED
          followersCount: 0,
          followingCount: 0,
          createdAt: new Date(),
        });
        setUserInfo({
          name: currentUser.displayName || 'New User',
          pronouns: '',
          profileImage: undefined,
          bannerImage: undefined, // BANNER CODE ADDED
          followersCount: 0,
          followingCount: 0,
        });
      }
    } catch (error) {
      console.error('Error fetching user info:', error);
      Alert.alert('Error', 'Failed to load user information');
    }
  };

  // Fetch user's own posts
  const fetchUserPosts = async () => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      try {
        const q = query(
          collection(firestore, 'posts'),
          where('userId', '==', currentUser.uid)
        );
        const querySnapshot = await getDocs(q);
        const userPosts = querySnapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .filter((post) => !!post.imageUrl)
          .sort((a, b) => b.createdAt - a.createdAt); // sort by createdAt desc
        setPosts(userPosts);
      } catch (error) {
        console.error('Error fetching user posts:', error);
      }
    }
  };

  // Fetch saved recipes
  const fetchSavedRecipes = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;
    try {
      const q = query(
        collection(firestore, 'recipes'),
        where('uid', '==', currentUser.uid)
      );
      const snapshot = await getDocs(q);
      const userRecipes = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((recipe) => !!recipe.name)
        .sort((a, b) => {
          if (a.createdAt && b.createdAt) {
            return b.createdAt.seconds - a.createdAt.seconds;
          }
          return 0;
        });
      setSavedRecipes(userRecipes);
    } catch (error) {
      console.error('Error fetching user recipes:', error);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchUserInfo();
      fetchUserPosts();
      fetchSavedRecipes();
    }, [])
  );

  // Logout handler
  const handleLogout = async () => {
    Alert.alert('Confirm Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        onPress: async () => {
          try {
            await auth.signOut();
            navigation.navigate('Login');
          } catch (error) {
            Alert.alert('Error', 'Logout failed.');
          }
        },
      },
    ]);
  };

  // Image picker for profile image
  const pickProfileImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      if (!result.canceled) {
        setUploading(true);
        const imageUrl = await uploadImage(result.assets[0].uri);
        setEditProfileImage(imageUrl);
        setUploading(false);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  // Image picker for banner image (BANNER CODE ADDED)
  const pickBannerImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });
      if (!result.canceled) {
        setUploading(true);
        const imageUrl = await uploadImage(result.assets[0].uri);
        setEditBannerImage(imageUrl);
        setUploading(false);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick banner image');
    }
  };

  // Save profile changes
  const handleSaveProfile = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;
    try {
      setLoading(true);
      await updateDoc(doc(firestore, 'users', currentUser.uid), {
        name: editName,
        pronouns: editPronouns,
        profileImage: editProfileImage,
        bannerImage: editBannerImage,
      });
      setShowEditProfile(false);
      fetchUserInfo();
    } catch (error) {
      Alert.alert('Error', 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  // Open edit profile modal pre-populated with existing data
  const openEditProfile = () => {
    setEditName(userInfo.name);
    setEditPronouns(userInfo.pronouns || '');
    setEditProfileImage(userInfo.profileImage || null);
    setEditBannerImage(userInfo.bannerImage || null);
    setShowEditProfile(true);
  };

  // Render each post in user's profile
  const renderPost = ({ item, index }: { item: DocumentData; index: number }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('BigPost', { posts, initialIndex: index })}
    >
      <Image
        source={{ uri: item.imageUrl }}
        style={{
          width: screenWidth / 3 - 4,
          height: screenWidth / 3,
          margin: 1,
        }}
        resizeMode="cover"
      />
    </TouchableOpacity>
  );

  // Render each saved recipe
  const renderSaved = ({ item, index }: { item: DocumentData; index: number }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('BigRecipe', { recipe: item })}
      style={{
        width: screenWidth / 3 - 4,
        height: screenWidth / 3,
        margin: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
      }}
    >
      <Text style={{ textAlign: 'center', color: '#333', paddingHorizontal: 4 }}>
        {item.name || 'No Title'}
      </Text>
    </TouchableOpacity>
  );

  // Main UI
  return (
    <View style={{ flex: 1, backgroundColor: '#c4a381' }}>
      {/* Banner */}
      <Image
        source={{ uri: userInfo.bannerImage || 'https://placehold.co/400x120/png?text=Banner' }}
        style={{ width: '100%', height: 120 }}
      />

      {/* Profile Section */}
      <View style={{ alignItems: 'center', marginTop: -40 }}>
        <Image
          source={{
            uri: userInfo.profileImage || 'https://placehold.co/100x100?text=User',
          }}
          style={{
            width: 80,
            height: 80,
            borderRadius: 40,
            borderWidth: 2,
            borderColor: '#fff',
          }}
        />
        <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#fff', marginTop: 8 }}>
          {userInfo.name}
        </Text>
        {userInfo.pronouns ? (
          <Text style={{ fontSize: 14, color: '#fff' }}>({userInfo.pronouns})</Text>
        ) : null}

        <View style={{ flexDirection: 'row', marginTop: 6 }}>
          <Text style={{ fontSize: 14, color: '#fff', marginHorizontal: 10 }}>
            {userInfo.followersCount} followers
          </Text>
          <Text style={{ fontSize: 14, color: '#fff', marginHorizontal: 10 }}>
            {userInfo.followingCount} following
          </Text>
        </View>

        <View style={{ flexDirection: 'row', marginTop: 10, gap: 10 }}>
          {/* Updated buttons: white background with brown text (#c4a381) */}
          <TouchableOpacity
            onPress={openEditProfile}
            style={{
              backgroundColor: '#fff',
              paddingHorizontal: 20,
              paddingVertical: 8,
              borderRadius: 10,
            }}
          >
            <Text style={{ fontSize: 14, color: '#c4a381' }}>Edit Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleLogout}
            style={{
              backgroundColor: '#fff',
              paddingHorizontal: 20,
              paddingVertical: 8,
              borderRadius: 10,
            }}
          >
            <Text style={{ fontSize: 14, color: '#c4a381' }}>Log Out</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Tabs */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-around',
          borderBottomWidth: 1,
          borderColor: '#ddd',
          paddingVertical: 10,
          marginTop: 20,
        }}
      >
        <TouchableOpacity onPress={() => setSelectedTab('posts')}>
          <Text style={{ fontWeight: selectedTab === 'posts' ? 'bold' : 'normal', color: '#fff' }}>
            POSTS
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setSelectedTab('saved')}>
          <Text style={{ fontWeight: selectedTab === 'saved' ? 'bold' : 'normal', color: '#fff' }}>
            SAVED
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {selectedTab === 'posts' ? (
        posts.length > 0 ? (
          <FlatList
            data={posts}
            keyExtractor={(_, index) => index.toString()}
            renderItem={({ item, index }) => renderPost({ item, index })}
            numColumns={3}
            contentContainerStyle={{ paddingBottom: 100 }}
          />
        ) : (
          <Text style={{ textAlign: 'center', marginTop: 20, color: '#fff' }}>
            No posts yet
          </Text>
        )
      ) : savedRecipes.length > 0 ? (
        <FlatList
          data={savedRecipes}
          keyExtractor={(_, index) => index.toString()}
          renderItem={({ item, index }) => renderSaved({ item, index })}
          numColumns={3}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      ) : (
        <Text style={{ textAlign: 'center', marginTop: 20, color: '#fff' }}>
          No saved recipes yet
        </Text>
      )}

      {/* Edit Profile Modal */}
      <Modal visible={showEditProfile} animationType="slide" transparent>
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.4)',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <View
            style={{
              backgroundColor: '#fff',
              borderRadius: 20,
              width: '85%',
              padding: 20,
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
              Edit Profile
            </Text>

            {/* Pick Banner */}
            <TouchableOpacity
              onPress={pickBannerImage}
              disabled={uploading}
              style={{ alignItems: 'center', marginBottom: 10 }}
            >
              {editBannerImage ? (
                <Image
                  source={{ uri: editBannerImage }}
                  style={{ width: '100%', height: 80, borderRadius: 8 }}
                />
              ) : (
                <View
                  style={{ width: '100%', height: 80, borderRadius: 8, backgroundColor: '#ccc' }}
                />
              )}
              {uploading && <ActivityIndicator style={{ marginTop: 5 }} />}
              <Text style={{ color: '#007AFF', marginTop: 6 }}>Change Banner</Text>
            </TouchableOpacity>

            {/* Pick Profile Image */}
            <TouchableOpacity
              onPress={pickProfileImage}
              disabled={uploading}
              style={{ alignItems: 'center', marginBottom: 10 }}
            >
              {editProfileImage ? (
                <Image
                  source={{ uri: editProfileImage }}
                  style={{ width: 80, height: 80, borderRadius: 40 }}
                />
              ) : (
                <View
                  style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: '#ccc' }}
                />
              )}
              {uploading && <ActivityIndicator style={{ marginTop: 5 }} />}
              <Text style={{ color: '#007AFF', marginTop: 6 }}>Change Profile Photo</Text>
            </TouchableOpacity>

            <TextInput
              value={editName}
              onChangeText={setEditName}
              placeholder="Name"
              style={{
                borderWidth: 1,
                borderColor: '#ccc',
                borderRadius: 10,
                padding: 10,
                marginBottom: 10,
              }}
            />
            <TextInput
              value={editPronouns}
              onChangeText={setEditPronouns}
              placeholder="Pronouns (e.g. she/her)"
              style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 10, padding: 10 }}
            />

            <TouchableOpacity
              onPress={handleSaveProfile}
              disabled={loading}
              style={{
                backgroundColor: '#007AFF',
                padding: 14,
                borderRadius: 10,
                marginTop: 20,
                alignItems: 'center',
              }}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>Save Changes</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setShowEditProfile(false)}
              style={{ marginTop: 10, alignItems: 'center' }}
            >
              <Text style={{ color: '#007AFF' }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default ProfileScreen;

import { collection, addDoc, serverTimestamp, getDoc, doc, updateDoc, setDoc } from 'firebase/firestore';
import { firestore, auth } from '../firebaseConfig';
import { uploadImage } from './imageService';

export type Post = {
  id?: string;
  userId: string;
  userName: string;
  imageUrl: string;
  caption: string;
  hashtags: string[];
  createdAt: any;
  likes: number;
  comments: any[];
};

export const createPost = async (imageUri: string, caption: string, hashtags: string[]): Promise<void> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User must be logged in to create a post');
    }

    // Upload image to Firebase Storage
    const imageUrl = await uploadImage(imageUri);

    // Create post in Firestore
    const postData: Omit<Post, 'id'> = {
      userId: user.uid,
      userName: user.displayName || 'Anonymous',
      imageUrl,
      caption,
      hashtags,
      createdAt: serverTimestamp(),
      likes: 0,
      comments: []
    };

    await addDoc(collection(firestore, 'posts'), postData);
  } catch (error) {
    console.error('Error creating post:', error);
    throw error;
  }
};

export const postService = {
  createPost,
  async likePost(postId: string): Promise<void> {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('You need to be logged in to like a post');
    }

    const postRef = doc(firestore, 'posts', postId);
    const postDoc = await getDoc(postRef);
    
    if (!postDoc.exists()) {
      throw new Error('Post not found');
    }

    const postData = postDoc.data() as Post;
    await updateDoc(postRef, {
      likes: postData.likes + 1
    });
  }
}; 
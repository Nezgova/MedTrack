import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Medicine = {
  name: string;
  amount: string;
  times: string[];
  completed: number;
};

export default function ProfilePage() {
  const [profile, setProfile] = useState({ name: '', email: '' });
  const [medicines, setMedicines] = useState<Medicine[]>([]);

  // Fetch data for profile and medicines
  const fetchProfileData = async () => {
    try {
      const storedMedicines = await AsyncStorage.getItem('medicines');
      const storedProfile = await AsyncStorage.getItem('profile');

      if (storedProfile) setProfile(JSON.parse(storedProfile));
      if (storedMedicines) setMedicines(JSON.parse(storedMedicines));
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, []);

  // Save profile data to AsyncStorage
  const saveProfile = async () => {
    try {
      await AsyncStorage.setItem('profile', JSON.stringify(profile));
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert('Error', 'Failed to save profile.');
    }
  };

  // Remove a medicine
  const removeMedicine = async (medicineName: string) => {
    if (Platform.OS === 'web') {
      // Web-specific confirmation
      const confirmed = window.confirm(`Are you sure you want to remove ${medicineName}?`);
      if (!confirmed) return;
    } else {
      // Mobile-specific confirmation
      Alert.alert(
        'Confirm Removal',
        `Are you sure you want to remove ${medicineName}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Remove',
            style: 'destructive',
            onPress: async () => {
              await handleMedicineRemoval(medicineName);
            },
          },
        ]
      );
      return;
    }

    // Proceed with removal if confirmed on web
    await handleMedicineRemoval(medicineName);
  };

  // Handle the actual removal logic
  const handleMedicineRemoval = async (medicineName: string) => {
    try {
      const updatedMedicines = medicines.filter((med) => med.name !== medicineName);
      await AsyncStorage.setItem('medicines', JSON.stringify(updatedMedicines));
      setMedicines(updatedMedicines);
      Alert.alert('Success', 'Medicine removed successfully.');
    } catch (error) {
      console.error('Error removing medicine:', error);
      Alert.alert('Error', 'Failed to remove medicine.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>

      {/* Profile Form */}
      <View style={styles.card}>
        <Text style={styles.label}>Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your name"
          value={profile.name}
          onChangeText={(text) => setProfile({ ...profile, name: text })}
        />
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your email"
          value={profile.email}
          onChangeText={(text) => setProfile({ ...profile, email: text })}
        />
        <TouchableOpacity style={styles.saveButton} onPress={saveProfile}>
          <Text style={styles.saveButtonText}>Save Profile</Text>
        </TouchableOpacity>
      </View>

      {/* Medicines List */}
      <Text style={styles.sectionTitle}>Your Medicines</Text>
      <FlatList
        data={medicines}
        keyExtractor={(item) => item.name}
        renderItem={({ item }) => (
          <View style={styles.medicineCard}>
            <Text style={styles.medicineName}>{item.name}</Text>
            <Text style={styles.medicineDetails}>
              {item.amount} pills • {item.times.length} doses/day
            </Text>
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => removeMedicine(item.name)}
            >
              <Text style={styles.removeButtonText}>Remove</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F7',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: '#555',
    marginBottom: 5,
  },
  input: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#DDD',
  },
  saveButton: {
    backgroundColor: '#22C55E',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  saveButtonText: {
    fontSize: 16,
    color: '#FFF',
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 30,
    marginBottom: 15,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  medicineCard: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  medicineName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  medicineDetails: {
    fontSize: 14,
    color: '#555',
  },
  removeButton: {
    marginTop: 10,
    backgroundColor: '#EF4444',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  removeButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
});

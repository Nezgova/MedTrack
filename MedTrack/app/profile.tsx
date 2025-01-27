import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Platform,
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

  const fetchProfileData = async () => {
    try {
      console.log('Fetching profile data...');
      const storedMedicines = await AsyncStorage.getItem('medicines');
      const storedProfile = await AsyncStorage.getItem('profile');
      
      if (storedProfile) setProfile(JSON.parse(storedProfile));
      if (storedMedicines) {
        const parsedMedicines = JSON.parse(storedMedicines);
        console.log('Setting medicines state:', parsedMedicines);
        setMedicines(parsedMedicines);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, []);

  const saveProfile = async () => {
    try {
      await AsyncStorage.setItem('profile', JSON.stringify(profile));
      if (Platform.OS === 'web') {
        window.alert('Profile updated successfully');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      if (Platform.OS === 'web') {
        window.alert('Failed to save profile');
      }
    }
  };

  const removeMedicine = async (medicineName: string) => {
    // For web, use window.confirm instead of Alert
    if (Platform.OS === 'web') {
      const confirmed = window.confirm(`Are you sure you want to remove ${medicineName}?`);
      if (!confirmed) return;
    }
    
    console.log('Removing medicine:', medicineName);
    try {
      const updatedMedicines = medicines.filter(med => med.name !== medicineName);
      await AsyncStorage.setItem('medicines', JSON.stringify(updatedMedicines));
      setMedicines(updatedMedicines);
      if (Platform.OS === 'web') {
        window.alert('Medicine removed successfully');
      }
      fetchProfileData(); // Refresh the data
    } catch (error) {
      console.error('Error removing medicine:', error);
      if (Platform.OS === 'web') {
        window.alert('Failed to remove medicine');
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Edit Profile</Text>
      <TextInput
        style={styles.input}
        placeholder="Name"
        value={profile.name}
        onChangeText={(text) => setProfile({ ...profile, name: text })}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={profile.email}
        onChangeText={(text) => setProfile({ ...profile, email: text })}
      />
      <TouchableOpacity style={styles.saveButton} onPress={saveProfile}>
        <Text style={styles.saveButtonText}>Save Profile</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Your Medicines</Text>
      <FlatList
        data={medicines}
        keyExtractor={(item) => item.name}
        renderItem={({ item }) => (
          <View style={styles.medicineItem}>
            <Text style={styles.medicineName}>{item.name}</Text>
            <Text>{item.amount} pills • {Array.isArray(item.times) ? item.times.length : 0} doses/day</Text>
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
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 10,
    marginBottom: 20,
    backgroundColor: '#fff',
  },
  saveButton: {
    backgroundColor: 'blue',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  saveButtonText: { color: '#fff', fontSize: 16 },
  medicineItem: {
    padding: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    backgroundColor: '#fff',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  medicineName: { fontSize: 18, fontWeight: 'bold', marginBottom: 5 },
  removeButton: {
    marginTop: 10,
    backgroundColor: 'red',
    padding: 10,
    borderRadius: 5,
  },
  removeButtonText: { color: 'white', textAlign: 'center' },
});
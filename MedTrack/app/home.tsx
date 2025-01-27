import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CircularProgress from 'react-native-circular-progress-indicator';

type Medicine = {
  name: string;
  amount: string;
  times: string[];
  completed: number;
};

export default function HomeScreen() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [profileName, setProfileName] = useState(''); // Store the user's name
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch medicines
        const storedMedicines = await AsyncStorage.getItem('medicines');
        const medicinesData = storedMedicines ? JSON.parse(storedMedicines) : [];
        if (Array.isArray(medicinesData)) {
          setMedicines(
            medicinesData.map((med) => ({
              ...med,
              times: Array.isArray(med.times) ? med.times : [],
              completed: med.completed || 0,
            }))
          );
        }

        // Fetch profile name
        const storedProfile = await AsyncStorage.getItem('profile');
        if (storedProfile) {
          const { name } = JSON.parse(storedProfile);
          setProfileName(name || ''); // Set the name if available
        }

        // Check and reset medicines if a new day starts
        const lastResetDate = await AsyncStorage.getItem('lastResetDate');
        const today = new Date().toISOString().split('T')[0];
        if (lastResetDate !== today) {
          resetDailyMedicines();
          await AsyncStorage.setItem('lastResetDate', today);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  // Reset daily medicines
  const resetDailyMedicines = async () => {
    const updatedMedicines = medicines.map((med) => ({
      ...med,
      completed: 0,
    }));
    setMedicines(updatedMedicines);
    await AsyncStorage.setItem('medicines', JSON.stringify(updatedMedicines));
  };

  const handleMarkAsTaken = async (medicine: Medicine) => {
    const updatedMedicines = medicines.map((med) =>
      med.name === medicine.name
        ? { ...med, completed: Math.min(med.completed + 1, med.times.length) }
        : med
    );
    setMedicines(updatedMedicines);
    await AsyncStorage.setItem('medicines', JSON.stringify(updatedMedicines));
  };

  const totalDoses = medicines.reduce((sum, med) => sum + (med.times?.length || 0), 0);
  const completedDoses = medicines.reduce((sum, med) => sum + (med.completed || 0), 0);
  const progress = totalDoses > 0 ? (completedDoses / totalDoses) * 100 : 0;

  const filteredMedicines = medicines.filter((med) =>
    med.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const notCompletedMedicines = filteredMedicines.filter(
    (med) => med.completed < med.times.length
  );

  const completedMedicines = filteredMedicines.filter(
    (med) => med.completed === med.times.length
  );

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Greeting Section */}
      <View style={styles.greetingContainer}>
        <Text style={styles.greetingText}>Hello, {profileName || 'User'}</Text>
        <Text style={styles.planText}>Your plan for today</Text>
      </View>

      {/* Daily Progress Card */}
      <View style={styles.progressCard}>
        <CircularProgress
          value={progress}
          radius={50}
          maxValue={100}
          valueSuffix="%"
          activeStrokeColor="green"
          inActiveStrokeColor="lightgray"
          titleColor="#333"
          titleStyle={{ fontWeight: 'bold', fontSize: 12 }}
        />
        <Text style={styles.completedText}>
          {completedDoses} of {totalDoses} doses completed
        </Text>
      </View>

      {/* Daily Review Section */}
      <Text style={styles.sectionTitle}>Pending Medicines</Text>
      <FlatList
        data={notCompletedMedicines}
        keyExtractor={(item) => item.name}
        renderItem={({ item }) => (
          <View style={styles.medicineCard}>
            <View>
              <Text style={styles.medicineName}>{item.name}</Text>
              <Text style={styles.medicineDetails}>
                {item.amount} pills • {item.times.length} doses/day
              </Text>
            </View>
            <TouchableOpacity
              style={styles.takenButton}
              onPress={() => handleMarkAsTaken(item)}
            >
              <Text style={styles.takenButtonText}>Mark as Taken</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      {/* Completed Medicines Section */}
      <Text style={styles.sectionTitle}>Completed Medicines</Text>
      <FlatList
        data={completedMedicines}
        keyExtractor={(item) => item.name}
        renderItem={({ item }) => (
          <View style={styles.medicineCard}>
            <View>
              <Text style={styles.medicineName}>{item.name}</Text>
              <Text style={styles.medicineDetails}>
                {item.amount} pills • {item.times.length} doses/day
              </Text>
              <Text style={styles.completedText}>All doses completed</Text>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#F7F7F7' },
  searchContainer: { marginBottom: 20 },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    backgroundColor: '#fff',
    fontSize: 16,
  },
  greetingContainer: { marginBottom: 20 },
  greetingText: { fontSize: 24, fontWeight: 'bold', marginBottom: 5 },
  planText: { fontSize: 16, color: '#555', marginBottom: 10 },
  progressCard: {
    alignItems: 'center',
    marginBottom: 20,
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  completedText: { fontSize: 14, marginTop: 10, color: '#555' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  medicineCard: {
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#fff',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  medicineName: { fontSize: 16, fontWeight: 'bold' },
  medicineDetails: { fontSize: 14, color: '#555', marginTop: 5 },
  takenButton: {
    backgroundColor: '#22c55e',
    padding: 10,
    borderRadius: 5,
  },
  takenButtonText: { color: '#fff', fontWeight: 'bold', textAlign: 'center' },
});

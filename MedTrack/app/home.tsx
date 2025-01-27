import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CircularProgress from 'react-native-circular-progress-indicator';

type Medicine = {
  name: string;
  amount: string;
  times: string[]; // Array of times for each dose
  completed: number; // Number of doses completed
};

export default function HomeScreen() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);

  // Fetch data from AsyncStorage
  useEffect(() => {
    const fetchMedicines = async () => {
      try {
        const storedData = await AsyncStorage.getItem('medicines');
        const data = storedData ? JSON.parse(storedData) : [];
        console.log('Fetched data:', data); // Debug the data

        // Ensure data is valid
        if (Array.isArray(data)) {
          setMedicines(
            data.map((med) => ({
              ...med,
              times: Array.isArray(med.times) ? med.times : [], // Ensure `times` is an array
              completed: med.completed || 0, // Initialize `completed` if missing
            }))
          );
        } else {
          setMedicines([]); // Fallback to empty array
        }
      } catch (error) {
        console.error('Error fetching medicines:', error);
        setMedicines([]); // Fallback to empty array on error
      }
    };

    fetchMedicines();
  }, []);

  // Calculate total doses and completed doses
  const totalDoses = medicines.reduce((sum, med) => sum + (med.times?.length || 0), 0);
  const completedDoses = medicines.reduce((sum, med) => sum + (med.completed || 0), 0);
  const progress = totalDoses > 0 ? (completedDoses / totalDoses) * 100 : 0;

  // Handle marking a dose as completed
  const handleCompleteDose = (item: Medicine) => {
    setMedicines((prev) =>
      prev.map((med) =>
        med.name === item.name
          ? { ...med, completed: Math.min((med.completed || 0) + 1, med.times.length) }
          : med
      )
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Daily Review</Text>

      {/* Circular Progress Bar */}
      <View style={styles.progressContainer}>
        <CircularProgress
          value={progress}
          radius={60}
          maxValue={100}
          valueSuffix="%"
          activeStrokeColor="green"
          inActiveStrokeColor="lightgray"
          titleColor="#333"
          titleStyle={{ fontWeight: 'bold' }}
        />
      </View>

      {/* Medicine List */}
      <FlatList
        data={medicines}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => {
          // Validate item
          if (!item || !item.times || !Array.isArray(item.times)) {
            return (
              <View style={styles.medicineItem}>
                <Text style={styles.errorText}>Invalid medicine data</Text>
              </View>
            );
          }

          return (
            <View style={styles.medicineItem}>
              <Text style={styles.medicineName}>{item.name}</Text>
              <Text>{item.amount} pills • {item.times.length} doses/day</Text>
              <Text>{item.completed || 0} of {item.times.length} doses completed</Text>
              <TouchableOpacity
                style={styles.completeButton}
                onPress={() => handleCompleteDose(item)}
              >
                <Text style={styles.completeButtonText}>Mark Dose as Taken</Text>
              </TouchableOpacity>
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  progressContainer: { alignItems: 'center', marginBottom: 20 },
  medicineItem: {
    marginBottom: 20,
    padding: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  medicineName: { fontSize: 18, fontWeight: 'bold', marginBottom: 5 },
  errorText: { color: 'red', fontWeight: 'bold' },
  completeButton: {
    marginTop: 10,
    backgroundColor: 'green',
    padding: 10,
    borderRadius: 5,
  },
  completeButtonText: {
    color: 'white',
    textAlign: 'center',
  },
});

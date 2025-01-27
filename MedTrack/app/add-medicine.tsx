import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

type Medicine = {
  name: string;
  amount: string;
  times: string[];
  duration: string;
};

export default function AddMedicineScreen() {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [frequency, setFrequency] = useState(1); // Number of doses per day
  const [days, setDays] = useState('30'); // Duration in days
  const [times, setTimes] = useState<string[]>([]); // Times for each dose
  const router = useRouter();

  const handleSave = async () => {
    if (!name || !amount || times.length !== frequency) {
      Alert.alert('Error', 'Please fill in all fields and provide times for all doses');
      return;
    }

    const newMedicine: Medicine = {
      name,
      amount,
      times,
      duration: days,
    };

    try {
      const existingData = await AsyncStorage.getItem('medicines');
      const medicines = existingData ? JSON.parse(existingData) : [];
      medicines.push(newMedicine);
      await AsyncStorage.setItem('medicines', JSON.stringify(medicines));

      Alert.alert('Success', 'Medicine added successfully!', [
        { text: 'OK', onPress: () => router.push('/home') },
      ]);
    } catch (error) {
      console.error('Error saving medicine:', error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Plan</Text>
      </View>

      {/* Pill Name */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Pill Name</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Enter medicine name"
            placeholderTextColor="#999"
          />
        </View>
      </View>

      {/* Amount & Duration */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Amount & Duration</Text>
        <View style={styles.row}>
          <View style={[styles.inputContainer, styles.flex1]}>
            <TextInput
              style={styles.input}
              value={amount}
              onChangeText={setAmount}
              placeholder="Number of pills"
              keyboardType="numeric"
              placeholderTextColor="#999"
            />
          </View>
          <View style={[styles.inputContainer, styles.flex1, styles.marginLeft]}>
            <TextInput
              style={styles.input}
              value={days}
              onChangeText={setDays}
              placeholder="Number of days"
              keyboardType="numeric"
              placeholderTextColor="#999"
            />
          </View>
        </View>
      </View>

      {/* Frequency & Times */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Frequency (doses/day)</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={frequency.toString()}
            onChangeText={(value) => {
              const newFrequency = Number(value);
              setFrequency(newFrequency);
              setTimes((prev) => prev.slice(0, newFrequency));
            }}
            placeholder="How many times a day?"
            keyboardType="numeric"
            placeholderTextColor="#999"
          />
        </View>
      </View>

      {/* Times for Each Dose */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Times for Each Dose</Text>
        {Array.from({ length: frequency }, (_, index) => (
          <View key={index} style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder={`Time for dose ${index + 1}`}
              onChangeText={(time) => {
                const updatedTimes = [...times];
                updatedTimes[index] = time;
                setTimes(updatedTimes);
              }}
              value={times[index] || ''}
              placeholderTextColor="#999"
            />
          </View>
        ))}
      </View>

      {/* Done Button */}
      <TouchableOpacity style={styles.doneButton} onPress={handleSave}>
        <Text style={styles.doneButtonText}>Save</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  backButton: {
    fontSize: 24,
    marginRight: 15,
    color: '#666',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 12,
    minHeight: 56,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  flex1: {
    flex: 1,
  },
  marginLeft: {
    marginLeft: 12,
  },
  doneButton: {
    backgroundColor: '#22c55e',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 32,
    marginBottom: Platform.OS === 'ios' ? 48 : 24,
  },
  doneButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

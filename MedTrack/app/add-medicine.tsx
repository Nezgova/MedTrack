import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

type Medicine = {
  name: string;
  amount: string;
  times: string[]; 
};

export default function AddMedicineScreen() {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [frequency, setFrequency] = useState(1);
  const [times, setTimes] = useState<string[]>([]); 
  const router = useRouter();

  const handleAddTime = (time: string) => {
    setTimes((prev) => [...prev, time]); // Add a new time
  };

  const handleSave = async () => {
    if (!name || !amount || times.length !== frequency) {
      Alert.alert('Error', 'Please fill in all fields and provide times for all doses');
      return;
    }

    const newMedicine: Medicine = { name, amount, times };

    try {
      const existingData = await AsyncStorage.getItem('medicines');
      const medicines = existingData ? JSON.parse(existingData) : [];
      medicines.push(newMedicine);
      await AsyncStorage.setItem('medicines', JSON.stringify(medicines));

      Alert.alert('Success', 'Medicine added successfully');
      router.push('/home');
    } catch (error) {
      console.error('Error saving medicine:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add Medicine</Text>

      <TextInput
        style={styles.input}
        placeholder="Pill Name"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Amount (e.g., 2 pills)"
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="Frequency (e.g., 3 times/day)"
        value={frequency.toString()}
        onChangeText={(value) => setFrequency(Number(value))}
        keyboardType="numeric"
      />

      {/* Input Times for Each Dose */}
      {Array.from({ length: frequency }, (_, index) => (
        <TextInput
          key={index}
          style={styles.input}
          placeholder={`Time for dose ${index + 1} (e.g., 08:00 AM)`}
          onChangeText={(time) => {
            const updatedTimes = [...times];
            updatedTimes[index] = time;
            setTimes(updatedTimes);
          }}
          value={times[index] || ''}
        />
      ))}

      <Button title="Save" onPress={handleSave} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  input: { borderWidth: 1, borderRadius: 10, padding: 10, marginBottom: 20 },
});

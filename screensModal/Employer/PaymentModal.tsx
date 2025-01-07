import React from 'react';
import { Modal, View, Text, TouchableOpacity, ScrollView, StyleSheet, Linking } from 'react-native';
import { useMutation } from '@tanstack/react-query';
import { Payment } from '../../Services/Payment/Payment';
import { Alert } from 'react-native';

interface Props {
  onClose?: () => void;
  navigation?:any
}

export default function PaymentModal({ onClose ,navigation }: Props) {
//   const Email = localStorage.getItem('Email');

  const { mutate, isPending } = useMutation({
    mutationFn: Payment,
    onSuccess: (data) => {
      console.log('okchua', data.result);
    //   Alert.alert('Success', 'Payment successfully!');
      // Open a new browser tab for the payment link
      // Linking.openURL(data.result);
      navigation.navigate('PaymentScreen', { paymentUrl: data.result });
    },
    onError: () => {
      Alert.alert('Error', 'Failed to make payment.');
    },
  });

  const handlePayment = () => {
    mutate({
      data: {
        orderType: 'NCB',
        amount: 5077000,
        orderDescription: '',
        name: "",
      },
    });
  };

  return (
    <Modal transparent={true} animationType="slide" visible={true} onRequestClose={onClose}>
      <View style={styles.backdrop} onTouchEnd={onClose}>
        <View style={styles.modalContainer} onTouchStart={(e) => e.stopPropagation()}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeText}>X</Text>
          </TouchableOpacity>
          <ScrollView style={styles.content}>
            <Text style={styles.header}>Post Job to find the best candidates</Text>
            <Text style={styles.description}>
              Discover our professional tools for finding the best candidates. Save time and find
              the perfect fit for your roles with our professional recruiting tools.
            </Text>
            <View style={styles.card}>
              <Text style={styles.cardHeader}>Access</Text>
              <Text style={styles.cardSubHeader}>Get Started posting Job</Text>
              <Text style={styles.priceText}>
                <Text style={styles.priceAmount}>$200</Text>/month
              </Text>
              <Text style={styles.includesText}>Includes:</Text>
              <View>
                <Text style={styles.listItem}>• Post Unlimited Jobs</Text>
                <Text style={styles.listItem}>• Review Applicants</Text>
                <Text style={styles.listItem}>• Quick Accept/Reject with Templates</Text>
                <Text style={styles.listItem}>• Advanced Applicant Filters</Text>
              </View>
              <TouchableOpacity
                style={styles.button}
                onPress={isPending ? undefined : handlePayment}
                disabled={isPending}
              >
                <Text style={styles.buttonText}>{isPending ? 'Wait a second...' : 'Upgrade'}</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(14, 17, 17, 0.57)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 4,
    padding: 20,
    maxHeight: '90%',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  closeText: {
    fontSize: 18,
    color: '#9194a0',
  },
  content: {
    marginTop: 20,
  },
  header: {
    fontSize: 36,
    fontWeight: '600',
    marginBottom: 24,
  },
  description: {
    fontSize: 20,
    color: '#616161',
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 20,
    marginBottom: 20,
  },
  cardHeader: {
    fontSize: 16,
    fontWeight: '700',
  },
  cardSubHeader: {
    color: '#757575',
    fontSize: 14,
    marginBottom: 16,
  },
  priceText: {
    fontSize: 14,
    marginBottom: 24,
  },
  priceAmount: {
    fontSize: 24,
    fontWeight: '700',
  },
  includesText: {
    fontWeight: '600',
    marginBottom: 4,
  },
  listItem: {
    fontSize: 14,
    color: '#050C26',
    marginBottom: 4,
  },
  button: {
    backgroundColor: '#0E1111',
    borderRadius: 4,
    padding: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
});

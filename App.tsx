import React, { useMemo, useState, useRef, useCallback } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, StyleSheet, Text, View, TouchableOpacity, Platform, Modal } from 'react-native';
import RepaymentEstimator from './components/RepaymentEstimator';
import { getTranslations, Language } from './i18n';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import { Slider } from '@miblanchard/react-native-slider';

function AppInner() {
  const [language, setLanguage] = useState<Language>('ur');
  const [isInfoModalVisible, setInfoModalVisible] = useState(false);
  const [selectedPaymentIndex, setSelectedPaymentIndex] = useState(2); // Start at middle option (Rs. 20,000)
  const [isSliderActive, setIsSliderActive] = useState(false);
  const [mainSliderRepayment, setMainSliderRepayment] = useState(20000); // Track main slider repayment
  const t = useMemo(() => getTranslations(language), [language]);
  const insets = useSafeAreaInsets();

  const toggleLanguage = () => {
    setLanguage((prev: Language) => (prev === 'ur' ? 'en' : 'ur'));
  };

  // Data for the payment scenarios
  const scenarios = useMemo(() => [
    { payment: 10000, duration: 48 },
    { payment: 17500, duration: 28 },
    { payment: 25000, duration: 20 },
    { payment: 32500, duration: 15 },
    { payment: 40000, duration: 12 },
  ], []);

  const currentScenario = scenarios[selectedPaymentIndex];
  const minPayment = scenarios[0].payment;
  const maxPayment = scenarios[scenarios.length - 1].payment;

  const handleSliderChange = (value: number | number[]) => {
    const sliderValue = Array.isArray(value) ? value[0] : value;
    const newIndex = Math.round(sliderValue);
    setSelectedPaymentIndex(newIndex);
  };

  const handleSliderStart = () => {
    setIsSliderActive(true);
  };

  const handleSliderComplete = () => {
    setIsSliderActive(false);
  };

  const formatPKR = (amount: number, language: Language): string => {
    return amount.toString();
  };

  // Function to find the closest scenario index based on repayment amount
  const findClosestScenarioIndex = (repaymentAmount: number): number => {
    let closestIndex = 0;
    let minDifference = Math.abs(scenarios[0].payment - repaymentAmount);
    
    for (let i = 1; i < scenarios.length; i++) {
      const difference = Math.abs(scenarios[i].payment - repaymentAmount);
      if (difference < minDifference) {
        minDifference = difference;
        closestIndex = i;
      }
    }
    
    return closestIndex;
  };

  // Update modal slider position when modal opens
  const handleModalOpen = () => {
    const closestIndex = findClosestScenarioIndex(mainSliderRepayment);
    setSelectedPaymentIndex(closestIndex);
    setInfoModalVisible(true);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <View style={styles.container}>
        <View style={styles.content}>
          <RepaymentEstimator 
            initialKilometers={0} 
            lang={language}
            onValueChange={(kilometers, repayment) => setMainSliderRepayment(repayment)}
          />
        </View>
      </View>
      <View style={[styles.fabContainer, { bottom: (insets.bottom || 0) + 16 }]}>
        <TouchableOpacity
          onPress={toggleLanguage}
          accessibilityRole="button"
          accessibilityLabel={t.toggleLanguageA11y}
          style={styles.fabToggle}
        >
          <Text style={styles.fabText}>{language === 'ur' ? 'EN' : 'اردو'}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleModalOpen}
          accessibilityRole="button"
          accessibilityLabel="Show information"
          style={styles.fabInfo}
        >
          <Icon name="info" size={28} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <Modal
        // animationType="fade"
        transparent={true}
        visible={isInfoModalVisible}
        onRequestClose={() => setInfoModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity style={styles.closeButton} onPress={() => setInfoModalVisible(false)}>
              <Icon name="x" size={28} color="#9CA3AF" />
            </TouchableOpacity>

            <Text style={[styles.modalTitle, language === 'ur' && styles.urduModalTitle]}>
              {language === 'ur' ? (
                <>
                  اگر آپ <Text style={styles.boldText}>{formatPKR(currentScenario.payment, language)} روپے</Text> ماہانہ ادا کریں، تو آپ کا معاہدہ <Text style={styles.boldText}>{currentScenario.duration} مہینوں</Text> میں ختم ہو جائے گا۔
                </>
              ) : (
                <>
                  If you pay <Text style={styles.boldText}>Rs. {formatPKR(currentScenario.payment, language)}</Text> per month, your contract will end in <Text style={styles.boldText}>{currentScenario.duration} months</Text>.
                </>
              )}
            </Text>

            <View style={styles.sliderContainer}>
              <Slider
                value={selectedPaymentIndex}
                onValueChange={handleSliderChange}
                onSlidingStart={handleSliderStart}
                onSlidingComplete={handleSliderComplete}
                minimumValue={0}
                maximumValue={scenarios.length - 1}
                step={1}
                trackStyle={{ height: 6, borderRadius: 3 }}
                minimumTrackTintColor="#3B82F6"
                maximumTrackTintColor="#E5E7EB"
                thumbStyle={{ 
                  width: isSliderActive ? 24 : 20, 
                  height: isSliderActive ? 24 : 20,
                  backgroundColor: isSliderActive ? '#1D4ED8' : '#3B82F6',
                  shadowColor: isSliderActive ? '#1D4ED8' : '#3B82F6',
                  shadowOffset: { width: 0, height: isSliderActive ? 4 : 2 },
                  shadowOpacity: isSliderActive ? 0.4 : 0.3,
                  shadowRadius: isSliderActive ? 6 : 4,
                  elevation: isSliderActive ? 8 : 5,
                }}
              />
              
              {/* <View style={styles.sliderLabels}>
                <Text style={styles.sliderLabel}>Rs. {formatPKR(minPayment, language)}</Text>
                <Text style={styles.sliderLabel}>Rs. {formatPKR(maxPayment, language)}</Text>
              </View> */}
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppInner />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
  },
  content: {
    width: '100%',
    alignSelf: 'center',
    ...(Platform.select({ web: { maxWidth: 640 }, default: {} }) as object),
  },
  fabContainer: {
    position: 'absolute',
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  fabInfo: {
    borderRadius: 24,
    backgroundColor: '#6B7280',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  fabToggle: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: '#374151',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  fabText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: 360,
    backgroundColor: 'white',
    borderRadius: 16,
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 1,
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 20,
    textAlign: 'center',
    color: '#374151',
    marginTop: 30,
    marginBottom: 28,
    lineHeight: 28,
    paddingHorizontal: 10,
  },
  urduModalTitle: {
    fontSize: 22,
    lineHeight: 30,
  },
  boldText: {
    fontWeight: 'bold',
  },
  sliderContainer: {
    width: '100%',
    paddingHorizontal: 10,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  sliderLabel: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
});

import React, { useMemo, useState, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, StyleSheet, Text, View, TouchableOpacity, Platform, Modal, ScrollView, Dimensions, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import RepaymentEstimator from './components/RepaymentEstimator';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import { Language, getTranslations } from './i18n';

const { width } = Dimensions.get('window');
const MODAL_WIDTH = Math.min(width * 0.9, 400);

function AppInner() {
  const [language, setLanguage] = useState<Language>('ur');
  const [isInfoModalVisible, setInfoModalVisible] = useState(false);
  const [mainSliderRepayment, setMainSliderRepayment] = useState(20000);
  const [activeSlide, setActiveSlide] = useState(0); 
  const t = useMemo(() => getTranslations(language), [language]);
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef<ScrollView>(null);
  

  const toggleLanguage = () => {
    setLanguage((prev: Language) => (prev === 'ur' ? 'en' : 'ur'));
  };

  const scenarios = useMemo(() => [
    { payment: 10000, duration: 48 },
    { payment: 17500, duration: 28 },
    { payment: 25000, duration: 20 },
    { payment: 32500, duration: 15 },
    { payment: 40000, duration: 12 },
  ], []);

  const formatPKR = (amount: number): string => {
    return amount.toLocaleString('en-US');
  };

  const handleModalOpen = () => {
    setActiveSlide(0);
    scrollViewRef.current?.scrollTo({ x: 0, animated: false });
    setInfoModalVisible(true);
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const slideWidth = event.nativeEvent.layoutMeasurement.width;
    const offsetX = event.nativeEvent.contentOffset.x;
    const slideIndex = Math.round(offsetX / slideWidth);
    if (slideIndex !== activeSlide) {
      setActiveSlide(slideIndex);
    }
  };
  

  const allSlides = [
    { type: 'intro' },
    ...scenarios.map(s => ({ ...s, type: 'scenario' }))
  ];

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
          accessibilityLabel="Show examples"
          style={styles.fabExamples}
        >
          <Text style={styles.fabExamplesText}>{t.seeExamples}</Text>
        </TouchableOpacity>
      </View>

      <Modal
        transparent={true}
        visible={isInfoModalVisible}
        onRequestClose={() => setInfoModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity style={styles.closeButton} onPress={() => setInfoModalVisible(false)}>
              <Icon name="x" size={28} color="#9CA3AF" />
            </TouchableOpacity>

            <ScrollView
              disableIntervalMomentum={true}
              snapToInterval={MODAL_WIDTH}
              ref={scrollViewRef}
              horizontal
              pagingEnabled
              decelerationRate="fast"
              snapToAlignment="center"
              showsHorizontalScrollIndicator={false}
              onScroll={handleScroll}
              scrollEventThrottle={16}
              style={{ width: MODAL_WIDTH }}
              contentContainerStyle={{ alignItems: 'center', flexGrow: 1 }}
            >
              {/* Slide 1: Introduction */}
              <View style={styles.slide}>
                <Text style={[styles.modalTitle, language === 'ur' && styles.urduModalTitle]}>
                  {language === 'ur' 
                    ? "آئیے قرض کی ادائیگی کی رقم اور نظام الاوقات کی چند مثالیں دیکھتے ہیں۔"
                    : "Let's look at a few examples of loan repayment amounts and schedules."}
                </Text>
              </View>

              {scenarios.map((scenario, index) => {
                const kilometers = Math.max((scenario.payment - 8000) / 10, 0);
                return (
                  <View style={styles.slide} key={index}>
                    <Text style={[styles.modalTitle, language === 'ur' && styles.urduModalTitle]}>
                      {language === 'ur' ? (
                        <>
                          اگر آپ ہر مہینے اوسطاً <Text style={styles.boldText}>{formatPKR(Math.round(kilometers))} کلومیٹر</Text> چلاتے ہیں، جس کے نتیجے میں <Text style={styles.boldText}>{formatPKR(scenario.payment)} روپے</Text> فی مہینہ ادائیگی ہوتی ہے، تو آپ اپنا قرض <Text style={styles.boldText}>{scenario.duration} مہینوں</Text> میں ختم کر سکتے ہیں۔
                        </>
                      ) : (
                        <>
                          If you drive an average of <Text style={styles.boldText}>{formatPKR(Math.round(kilometers))} km</Text> each month, which results in a payment of <Text style={styles.boldText}>Rs. {formatPKR(scenario.payment)}</Text> per month, you can finish your loan in <Text style={styles.boldText}>{scenario.duration} months</Text>.
                        </>
                      )}
                    </Text>
                  </View>
                );
              })}
            </ScrollView>

            <View style={styles.dotContainer}>
              {allSlides.map((_, index) => (
                <View
                  key={index}
                  style={[styles.dot, activeSlide === index ? styles.dotActive : {}]}
                />
              ))}
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
  fabExamples: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 999,
    backgroundColor: '#3B82F6', 
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4.84,
    elevation: 6,
    minWidth: 140, 
  },
  fabText: {
    color: '#FFFFFF',
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  fabExamplesText: {
    color: '#FFFFFF',
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: MODAL_WIDTH,
    backgroundColor: 'white',
    borderRadius: 16,
    paddingVertical: 32, 
    paddingHorizontal: 0, 
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    maxHeight: '80%', 
    marginHorizontal: 16, 
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 1,
  },
  slide: {
    width: MODAL_WIDTH,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24, 
    paddingVertical: 20, 
    minHeight: 120, 
  },
  modalTitle: {
    fontSize: 20,
    textAlign: 'center',
    color: '#374151',
    lineHeight: 28,
  },
  urduModalTitle: {
    fontSize: 22,
    lineHeight: 36,
    fontFamily: Platform.OS === 'android' ? 'NotoNastaliqUrdu-Regular' : 'System', // Example font
  },
  boldText: {
    fontWeight: 'bold',
  },
  dotContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D1D5DB', 
    marginHorizontal: 4,
  },
  dotActive: {
    backgroundColor: '#3B82F6', 
  },
});
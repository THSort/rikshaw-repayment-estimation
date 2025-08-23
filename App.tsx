import React, { useMemo, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, StyleSheet, Text, View, TouchableOpacity, Platform } from 'react-native';
import RepaymentEstimator from './components/RepaymentEstimator';
import { getTranslations, Language } from './i18n';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';

function AppInner() {
  const [language, setLanguage] = useState<Language>('ur');
  const [currentColor, setCurrentColor] = useState<string>('#8B5CF6'); // default purple
  const t = useMemo(() => getTranslations(language), [language]);
  const insets = useSafeAreaInsets();

  const toggleLanguage = () => {
    setLanguage((prev: Language) => (prev === 'ur' ? 'en' : 'ur'));
  };

  const handleColorChange = (color: string) => {
    setCurrentColor(color);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <View style={styles.container}>
        <View style={styles.content}>
          <RepaymentEstimator 
            initialKilometers={0} 
            lang={language} 
            onColorChange={handleColorChange}
          />
        </View>
      </View>
      <TouchableOpacity
        onPress={toggleLanguage}
        accessibilityRole="button"
        accessibilityLabel={t.toggleLanguageA11y}
        style={[
          styles.fabToggle, 
          { 
            bottom: (insets.bottom || 0) + 16,
            backgroundColor: currentColor
          }
        ]}
      >
        <Text style={styles.fabText}>{language === 'ur' ? 'EN' : 'اردو'}</Text>
      </TouchableOpacity>
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
  fabToggle: {
    position: 'absolute',
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 999,
  },
  fabText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});

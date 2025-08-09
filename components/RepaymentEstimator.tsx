import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Platform, Image } from 'react-native';
import { Slider } from '@miblanchard/react-native-slider';
import { getTranslations, Language } from '../i18n';

export type RepaymentEstimatorProps = {
  initialKilometers?: number;
  onValueChange?: (kilometers: number, repayment: number) => void;
  lang?: Language;
};

function clamp(value: number, minValue: number, maxValue: number): number {
  return Math.min(Math.max(value, minValue), maxValue);
}

function calculateRepayment(kilometers: number): number {
  const base = 8000 + 10 * kilometers;
  const withMinimum = Math.max(base, 10000);
  const capped = Math.min(withMinimum, 40000);
  return Math.round(capped);
}

function formatPKR(amount: number, language: Language): string {
  return formatNumberByLanguage(amount, language);
}

function toUrduDigits(input: string): string {
  const mapping: Record<string, string> = {
    '0': '۰',
    '1': '۱',
    '2': '۲',
    '3': '۳',
    '4': '٤',
    '5': '۵',
    '6': '٦',
    '7': '۷',
    '8': '۸',
    '9': '۹',
  };
  return input.replace(/[0-9]/g, (d) => mapping[d] ?? d);
}

function formatNumberByLanguage(value: number, language: Language): string {
  // if(language !== 'ur') return value.toString();

  // Use ASCII digits first so our explicit mapping is always applied
  const base = value.toLocaleString('en-PK');
  if (language !== 'ur') return base;
  const urduDigits = toUrduDigits(base);
  // Use Arabic thousands separator to avoid bidi confusion with Latin comma
  const withArabicSeparator = urduDigits.replace(/,/g, '٬'); // U+066C
  // Wrap in RTL isolate to render correctly within mixed-direction text
  return `\u2067${withArabicSeparator}\u2069`;
}

export const RepaymentEstimator: React.FC<RepaymentEstimatorProps> = ({
  initialKilometers = 0,
  onValueChange,
  lang = 'ur',
}) => {
  const [kilometers, setKilometers] = useState<number>(clamp(initialKilometers, 0, 3800));
  const t = useMemo(() => getTranslations(lang), [lang]);

  const repayment = useMemo(() => calculateRepayment(kilometers), [kilometers]);

  const trackColor = useMemo(() => {
    if (kilometers < 200) return '#8B5CF6'; // purple-500
    if (kilometers < 3200) return '#3B82F6'; // blue-500
    return '#10B981'; // emerald-500
  }, [kilometers]);

  const handleChange = (value: number) => {
    const rounded = Math.round(value);
    setKilometers(rounded);
    if (onValueChange) onValueChange(rounded, calculateRepayment(rounded));
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.kmText, lang === 'ur' && styles.rtlText, { color: trackColor }]}>
        {formatNumberByLanguage(kilometers, lang)} {t.kmSuffix}
      </Text>

      <View style={styles.sliderRow}>
        <Text style={[styles.endLabel, lang === 'ur' && styles.rtlText]} numberOfLines={1}>
          {formatNumberByLanguage(0, lang)}
        </Text>
        <View style={styles.sliderWrapper}>
          <Slider
            value={kilometers}
            onValueChange={(v: number | number[]) => handleChange(Array.isArray(v) ? v[0] : v)}
            minimumValue={0}
            maximumValue={3800}
            step={1}
            // trackStyle={{ height: 8 }}
            thumbStyle={{ width: 35, height: 25 }}
            renderThumbComponent={() => (
              <Image
                  source={require('../assets/rickshaw.png')}
                  style={{ width: 35, height: 25, tintColor: trackColor, }}
                />
            )}
            minimumTrackTintColor={trackColor}
            maximumTrackTintColor="#374151"
            thumbTintColor={trackColor}
          />
        </View>
        <Text style={[styles.endLabel, lang === 'ur' && styles.rtlText]} numberOfLines={1}>
          {formatNumberByLanguage(3800, lang)}
        </Text>
      </View>

      <View style={styles.resultBlock}>
        <Text style={styles.subtitle}>{t.estimatedRepayment}</Text>
        <Text style={[styles.repaymentText, lang === 'ur' && styles.rtlText, { color: trackColor }]}>
          {formatPKR(repayment, lang)} {t.currencySuffix}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 8,
  },
  kmText: {
    fontSize: 40,
    fontWeight: Platform.OS === 'web' ? '700' : '800',
    textAlign: 'center',
    marginBottom: 16,
    color: '#F3F4F6',
  },
  sliderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sliderWrapper: {
    flex: 1,
    transform: [{ scaleY: Platform.OS === 'android' ? 1.4 : Platform.OS === 'ios' ? 1.4 : 1.25 }],
  },
  slider: {
    flex: 1,
    height: 168,
  },
  thumbOuter: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    backgroundColor: '#0B0F14',
    alignItems: 'center',
    justifyContent: 'center',
  },
  endLabel: {
    width: 54,
    textAlign: 'center',
    color: '#9CA3AF',
    fontSize: 20,
  },
  rtlText: {
    writingDirection: 'rtl',
  },
  resultBlock: {
    marginTop: 28,
    alignItems: 'center',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    color: '#D1D5DB',
  },
  repaymentText: {
    fontSize: 40,
    fontWeight: Platform.OS === 'web' ? '800' : '900',
    color: '#FFFFFF',
    textAlign: 'center',
  },
});

export default RepaymentEstimator; 
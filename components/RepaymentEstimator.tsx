import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, StyleSheet, Platform, Image, TouchableOpacity } from 'react-native';
import { Slider } from '@miblanchard/react-native-slider';
import { getTranslations, Language } from '../i18n';
import DashedLine from 'react-native-dashed-line';

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
  return value.toString();
  
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



// Hybrid mapping functions for finer control up to 1000km
function sliderToKm(sliderValue: number, maxKm: number): number {
  // For values up to 1000km, use half the slider range (0-0.5)
  // For values 1000km-maxKm, use the other half (0.5-1.0)
  const breakPoint = 0.5; // 50% of slider for 0-1000km
  const lowRange = 1000;
  const highRange = maxKm - lowRange;
  
  if (sliderValue <= breakPoint) {
    // First 50% of slider covers 0-1000km with fine control
    return (sliderValue / breakPoint) * lowRange;
  } else {
    // Remaining 50% of slider covers 1000km-maxKm with normal control
    const remainingSlider = (sliderValue - breakPoint) / (1 - breakPoint);
    return lowRange + (remainingSlider * highRange);
  }
}

function kmToSlider(km: number, maxKm: number): number {
  // Convert km value to slider position (0-1)
  const breakPoint = 0.5;
  const lowRange = 1000;
  
  if (km <= lowRange) {
    // 0-1000km maps to first 50% of slider
    return (km / lowRange) * breakPoint;
  } else {
    // 1000km-maxKm maps to remaining 50% of slider
    const highRange = maxKm - lowRange;
    const highRangeRatio = (km - lowRange) / highRange;
    return breakPoint + (highRangeRatio * (1 - breakPoint));
  }
}

export const RepaymentEstimator: React.FC<RepaymentEstimatorProps> = ({
  initialKilometers = 0,
  onValueChange,
  lang = 'ur',
}) => {
  const MAX_KM = 4000; // Increased from 3800
  const [kilometers, setKilometers] = useState<number>(clamp(initialKilometers, 0, MAX_KM));
  const [sliderValue, setSliderValue] = useState<number>(kmToSlider(clamp(initialKilometers, 0, MAX_KM), MAX_KM));
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);
  const [imageLoadedOnce, setImageLoadedOnce] = useState<boolean>(false);
  const [isSliderActive, setIsSliderActive] = useState<boolean>(false);
  const t = useMemo(() => getTranslations(lang), [lang]);

  const repayment = useMemo(() => calculateRepayment(kilometers), [kilometers]);

  const trackColor = useMemo(() => {
    if (kilometers < 200) return '#8B5CF6'; // purple-500
    if (kilometers < 3200) return '#3B82F6'; // blue-500
    return '#10B981'; // emerald-500
  }, [kilometers, sliderValue]);

  // Calculate boundary positions for repayment bounds using hybrid mapping
  const lowerBoundKm = 200; // where repayment stops being minimum
  const upperBoundKm = 3200; // where repayment stops increasing
  const lowerBoundPosition = kmToSlider(lowerBoundKm, MAX_KM) * 100;
  const upperBoundPosition = kmToSlider(upperBoundKm, MAX_KM) * 100;

  const handleSliderChange = (sliderVal: number) => {
    const kmValue = sliderToKm(sliderVal, MAX_KM);
    const rounded = Math.round(kmValue);
    const clamped = clamp(rounded, 0, MAX_KM);
    setKilometers(clamped);
    setSliderValue(kmToSlider(clamped, MAX_KM));
    if (onValueChange) onValueChange(clamped, calculateRepayment(clamped));
  };

  const handleDirectKmChange = (kmValue: number) => {
    const clamped = clamp(kmValue, 0, MAX_KM);
    setKilometers(clamped);
    setSliderValue(kmToSlider(clamped, MAX_KM));
    if (onValueChange) onValueChange(clamped, calculateRepayment(clamped));
  };

  // Simple 5-step increment functions (current client requirement)
  const handleIncrementSimple = () => {
    const step = 5;
    
    // If current value is not divisible by 5, snap to nearest divisible value first
    if (kilometers % step !== 0) {
      const snapped = Math.ceil(kilometers / step) * step; // Round up to next multiple of 5
      const clamped = Math.min(snapped, MAX_KM);
      handleDirectKmChange(clamped);
      return;
    }
    
    const newValue = Math.min(kilometers + step, MAX_KM);
    handleDirectKmChange(newValue);
  };

  const handleDecrementSimple = () => {
    const step = 5;
    
    // If current value is not divisible by 5, snap to nearest divisible value first
    if (kilometers % step !== 0) {
      const snapped = Math.floor(kilometers / step) * step; // Round down to previous multiple of 5
      const clamped = Math.max(snapped, 0);
      handleDirectKmChange(clamped);
      return;
    }
    
    const newValue = Math.max(kilometers - step, 0);
    handleDirectKmChange(newValue);
  };

  // Range-based increment functions (preserved for easy switching back)
  const handleIncrement = () => {
    // Fixed increments based on value ranges
    let increment;
    if (kilometers < 250) {
      increment = 5;
    } else if (kilometers < 1000) {
      increment = 50;
    } else {
      increment = 100;
    }
    
    // If current value is not divisible by increment, snap to nearest divisible value first
    if (kilometers % increment !== 0) {
      const snapped = Math.ceil(kilometers / increment) * increment; // Round up to next multiple
      const clamped = Math.min(snapped, MAX_KM);
      handleDirectKmChange(clamped);
      return;
    }
    
    const newValue = Math.min(kilometers + increment, MAX_KM);
    handleDirectKmChange(newValue);
  };

  const handleDecrement = () => {
    // Fixed decrements based on value ranges
    let decrement;
    if (kilometers <= 250) {
      decrement = 5;
    } else if (kilometers <= 1000) {
      decrement = 50;
    } else {
      decrement = 100;
    }
    
    // If current value is not divisible by decrement, snap to nearest divisible value first
    if (kilometers % decrement !== 0) {
      const snapped = Math.floor(kilometers / decrement) * decrement; // Round down to previous multiple
      const clamped = Math.max(snapped, 0);
      handleDirectKmChange(clamped);
      return;
    }
    
    const newValue = Math.max(kilometers - decrement, 0);
    handleDirectKmChange(newValue);
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.kmText, lang === 'ur' && styles.rtlText, { color: trackColor }]}>
        {formatNumberByLanguage(kilometers, lang)} {t.kmSuffix}
      </Text>

      <View style={styles.sliderContainer}>
        <View style={styles.sliderRow}>
          <View style={styles.sliderWrapper}>
            <View style={styles.sliderWithBounds}>
                <Slider
                  value={sliderValue}
                  onValueChange={(v: number | number[]) => handleSliderChange(Array.isArray(v) ? v[0] : v)}
                  onSlidingStart={() => setIsSliderActive(true)}
                  onSlidingComplete={() => setIsSliderActive(false)}
                  minimumValue={0}
                  maximumValue={1}
                  step={0.001}
                  thumbStyle={{ width: 35, height: 25 }}
                  renderThumbComponent={() => (
                    <View style={styles.thumbContainer}>
                      {/* Fallback thumb (always visible) */}
                      <View style={[
                        styles.fallbackThumb, 
                        { 
                          backgroundColor: trackColor, 
                          opacity: imageLoaded ? 0 : 1,
                          borderColor: (!imageLoaded && isSliderActive) ? '#000000' : 'transparent',
                          borderWidth: (!imageLoaded && isSliderActive) ? 2 : 0
                        }
                      ]} />
                      
                      {/* Rickshaw image (fades in when loaded) */}
                       {Platform.OS !== 'ios' && <Image
                         source={require('../assets/rickshaw.png')}
                         style={[
                           styles.rickshawImage, 
                           { 
                             tintColor: trackColor,
                             opacity: imageLoadedOnce ? 1 : 0
                           }
                         ]}
                         onLoad={() => {
                           if (!imageLoadedOnce) {
                             setImageLoaded(true);
                             setImageLoadedOnce(true);
                           }
                         }}
                         onError={() => {
                           setImageLoaded(false);
                           setImageLoadedOnce(false);
                         }}
                       />}
                    </View>
                )}
                  minimumTrackTintColor={trackColor}
                  maximumTrackTintColor="#374151"
                  thumbTintColor={trackColor}
                />
              {/* Boundary markers */}
              {/* <View style={[styles.boundaryLine, { marginLeft: 30, left: `${lowerBoundPosition}%` }]} /> */}
              <DashedLine dashColor='gray' style={[styles.boundaryLine, { marginLeft: 30, left: `${lowerBoundPosition}%` }]} axis='vertical' dashLength={5} />

              {/* <View style={[styles.boundaryLine, { left: `${upperBoundPosition}%` }]} /> */}
              <DashedLine dashColor='gray' style={[styles.boundaryLine, { left: `${upperBoundPosition}%` }]}  axis='vertical' dashLength={5} />
            </View>
          </View>
        </View>
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[
            styles.adjustButton, 
            { 
              backgroundColor: trackColor,
              opacity: kilometers <= 0 ? 0.3 : 1 
            }
          ]}
          onPress={handleDecrementSimple}
          disabled={kilometers <= 0}
          accessibilityRole="button"
          accessibilityLabel="Decrease distance"
        >
          <Text style={styles.adjustButtonText}>−</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.adjustButton, 
            { 
              backgroundColor: trackColor,
              opacity: kilometers >= MAX_KM ? 0.3 : 1 
            }
          ]}
          onPress={handleIncrementSimple}
          disabled={kilometers >= MAX_KM}
          accessibilityRole="button"
          accessibilityLabel="Increase distance"
        >
          <Text style={styles.adjustButtonText}>+</Text>
        </TouchableOpacity>
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
    paddingHorizontal: 12,
    paddingTop: 24,
    paddingBottom: 8,
  },
  kmText: {
    fontSize: 40,
    fontWeight: Platform.OS === 'web' ? '700' : '800',
    textAlign: 'center',
    marginBottom: 16,
    color: '#1F2937',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 24,
    paddingHorizontal: 16,
  },
  adjustButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  adjustButtonText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    lineHeight: 24,
  },
  sliderContainer: {
    width: '100%',
    paddingHorizontal: 16,
  },
  sliderRow: {
    width: '100%',
  },
  sliderWrapper: {
    width: '100%',
    transform: [{ scaleY: Platform.OS === 'android' ? 1.4 : Platform.OS === 'ios' ? 1.4 : 1.25 }],
  },
  sliderWithBounds: {
    position: 'relative',
    width: '100%',
  },
  boundaryLine: {
    position: 'absolute',
    zIndex: -1,
    top: -10,
    bottom: -10,
    width: 2,
    backgroundColor: 'transparent',
    opacity: 1,
    // borderStyle: 'dashed',
    borderWidth: 0,
    // borderLeftWidth: 2,
    // borderLeftColor: '#6B7280',
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderBottomWidth: 0,
  },
  slider: {
    flex: 1,
    height: 168,
  },
  thumbContainer: {
    position: 'relative',
    width: 35,
    height: 25,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  fallbackThumb: {
    position: 'absolute',
    backgroundColor: 'transparent',
    width: 35,
    height: 34,
    borderRadius: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  rickshawImage: {
    objectFit:'contain',
    position: 'absolute',
    width: 45, //35
    height: 35, //25
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
  rtlText: {
    writingDirection: 'rtl',
  },
  resultBlock: {
    marginTop: 28,
    alignItems: 'center',
  },
  subtitle: {
    fontSize: 28,
    fontWeight: '600',
    marginBottom: 8,
    color: '#374151',
  },
  repaymentText: {
    fontSize: 40,
    fontWeight: Platform.OS === 'web' ? '800' : '900',
    color: '#1F2937',
    textAlign: 'center',
  },
});

export default RepaymentEstimator; 
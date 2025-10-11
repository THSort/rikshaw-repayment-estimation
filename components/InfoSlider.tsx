import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getTranslations, Language } from '../i18n'; // Assuming you have this

interface InfoSlideProps {
  payment: number;
  duration: number;
  minPayment: number;
  maxPayment: number;
  lang?: Language;
}

function getColorForPayment(payment: number): string {
    if (payment <= 10000) return '#FACC15'; // yellow-400
    if (payment < 40000) return '#3B82F6'; // blue-500
    return '#10B981'; // emerald-500
  }

  const StaticSlider: React.FC<{ value: number; color: string }> = ({ value, color }) => ( // Accept color prop
    <View style={styles.staticSliderContainer}>
      <View style={styles.staticTrack}>
        {/* Use the dynamic color for the fill */}
        <View style={[styles.staticTrackFill, { width: `${value * 100}%`, backgroundColor: color }]} />
      </View>
      {/* Use the dynamic color for the thumb */}
      <View style={[styles.staticThumb, { left: `${value * 100}%`, backgroundColor: color }]} />
    </View>
  );

export const InfoSlide: React.FC<InfoSlideProps> = ({
  payment,
  duration,
  minPayment,
  maxPayment,
  lang = 'ur',
}) => {
  const t = getTranslations(lang);
  const slideColor = getColorForPayment(payment);

  // Normalize payment value to a 0-1 range for the static slider
  const sliderValue = (payment - minPayment) / (maxPayment - minPayment);

  // Replace placeholders in a translated string
  const slideText = t.infoSlideText
    .replace('XX', payment.toLocaleString())
    .replace('YY', duration.toString());

  return (
    <View style={styles.slide}>
      <Text style={styles.slideText}>{slideText}</Text>
      <StaticSlider value={sliderValue} color={slideColor} />
      <View style={styles.sliderLabels}>
        <Text style={styles.sliderLabelText}>{`Rs. ${minPayment.toLocaleString()}`}</Text>
        <Text style={styles.sliderLabelText}>{`Rs. ${maxPayment.toLocaleString()}`}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  slide: {
    width: 300, // Adjust width as needed
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  slideText: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 26,
    color: '#374151',
  },
  // Static slider styles
  staticSliderContainer: {
    width: '100%',
    height: 30,
    justifyContent: 'center',
  },
  staticTrack: {
    width: '100%',
    height: 6,
    borderRadius: 3,
    backgroundColor: '#D1D5DB', // gray-300
  },
  staticTrackFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: '#3B82F6', // blue-500
  },
  staticThumb: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    // Adjust for thumb's own width to center it on the line
    transform: [{ translateX: -10 }],
  },
  sliderLabels: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  sliderLabelText: {
    fontSize: 12,
    color: '#6B7280',
  },
});
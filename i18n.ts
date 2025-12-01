export type Language = 'en' | 'ur';

export type AppTranslations = {
  title: string;
  kmSuffix: string;
  estimatedRepayment: string;
  repaymentHint: string;
  monthlyKilometersA11y: string;
  currencySuffix: string;
  toggleLanguageA11y: string;
  perMonthSuffix: string;
  infoSlideText: string; 
  seeExamples: string;
};

const translations: Record<Language, AppTranslations> = {
  en: {
    perMonthSuffix: 'per month',
    title: 'Rickshaw App - Repayment Estimator',
    kmSuffix: 'km',
    estimatedRepayment: 'Estimated Repayment',
    repaymentHint: 'Repayment caps at 40,000 Rs (3,200 km). Additional slider range is a visual buffer.',
    monthlyKilometersA11y: 'Monthly kilometers',
    currencySuffix: 'Rs',
    toggleLanguageA11y: 'Toggle language',
    infoSlideText: 'If you pay Rs. XX per month, your contract will end in YY months.',
    seeExamples: 'See Examples',
  },
  ur: {
    perMonthSuffix: 'ماہانہ',
    title: 'رکشہ ایپ - ادائیگی تخمینہ',
    kmSuffix: 'کلومیٹر',
    estimatedRepayment: 'متوقع ادائیگی',
    repaymentHint: 'ادائیگی کی حد 40,000 روپے (3,200 کلومیٹر) ہے۔ سلائیڈر کی اضافی حد صرف بصری آسانی کے لیے ہے۔',
    monthlyKilometersA11y: 'ماہانہ کلومیٹر',
    currencySuffix: 'روپے',
    toggleLanguageA11y: 'زبان تبدیل کریں',
    infoSlideText: 'اگر آپ ماہانہ XX روپے ادا کرتے ہیں، تو آپ کا معاہدہ YY ماہ میں ختم ہو جائے گا۔',
    seeExamples: 'مثالیں دیکھیں',
  },
};

export function getTranslations(language: Language): AppTranslations {
  return translations[language] ?? translations.ur;
} 
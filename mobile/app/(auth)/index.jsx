import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp, ZoomIn, FadeInRight } from 'react-native-reanimated';

const slides = [
  {
    id: 1,
    icon: 'call',
    title: 'Welcome to Ericall',
    subtitle: 'Experience seamless communication. Connect instantly with high-quality voice.',
    features: [
      { icon: 'shield-checkmark', text: 'Secure & Private Conversations' },
      { icon: 'globe', text: 'Connect with Anyone, Anywhere' },
    ],
  },
  {
    id: 2,
    icon: 'wallet',
    title: 'Fast & Easy Payments',
    subtitle: 'Top up your credit securely and seamlessly using PayPal integration.',
    features: [
      { icon: 'logo-paypal', text: 'Secured by PayPal Payments' },
      { icon: 'flash', text: 'Instant Credit Updates' },
    ],
  }
];

export default function Onboarding() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      router.push('/register');
    }
  };

  const currentSlide = slides[currentIndex];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>

        {/* Image / Graphic Section (key forces re-animation on slide change) */}
        <Animated.View
          key={`image-${currentSlide.id}`}
          entering={ZoomIn.duration(600).springify().damping(15)}
          style={styles.imageContainer}
        >
          <View style={styles.iconCircle}>
            <Ionicons name={currentSlide.icon} size={60} color="#b88144" />
          </View>
        </Animated.View>

        {/* Text Content */}
        <View style={styles.textContainer}>
          <Animated.Text
            key={`title-${currentSlide.id}`}
            entering={FadeInRight.duration(500).delay(200)}
            style={styles.title}
          >
            {currentSlide.title}
          </Animated.Text>

          <Animated.Text
            key={`subtitle-${currentSlide.id}`}
            entering={FadeInRight.duration(500).delay(300)}
            style={styles.subtitle}
          >
            {currentSlide.subtitle}
          </Animated.Text>

          <View style={styles.featureList}>
            {currentSlide.features.map((feature, index) => (
              <Animated.View
                key={`feature-${currentSlide.id}-${index}`}
                entering={FadeInRight.duration(500).delay(400 + (index * 100))}
                style={styles.featureItem}
              >
                <Ionicons name={feature.icon} size={24} color="#b88144" />
                <Text style={styles.featureText}>{feature.text}</Text>
              </Animated.View>
            ))}
          </View>
        </View>

      </View>

      {/* Bottom Button and Pagination */}
      <View style={styles.footer}>

        {/* Pagination Dots */}
        <View style={styles.paginationContainer}>
          {slides.map((_, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => setCurrentIndex(index)}
              style={[
                styles.dot,
                currentIndex === index && styles.dotActive
              ]}
            />
          ))}
        </View>

        <Animated.View
          key={`button-${currentSlide.id}`}
          entering={FadeInUp.duration(500).delay(600)}
        >
          <TouchableOpacity
            style={styles.button}
            onPress={handleNext}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>
              {currentIndex === slides.length - 1 ? "Continue" : "Next"}
            </Text>
            <Ionicons
              name="arrow-forward"
              size={20}
              color="#ffffff"
              style={styles.buttonIcon}
            />
          </TouchableOpacity>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  imageContainer: {
    flex: 0.8,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 120,
  },
  iconCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(184, 129, 68, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#b88144',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  textContainer: {
    flex: 2,
    justifyContent: 'flex-start',
  },
  title: {
    fontSize: 34,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 16,
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  featureList: {
    marginTop: 10,
    gap: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  featureText: {
    marginLeft: 16,
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'ios' ? 30 : 40,
    paddingTop: 10,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#d1d5db',
    marginHorizontal: 5,
  },
  dotActive: {
    backgroundColor: '#b88144',
    width: 20,
  },
  button: {
    backgroundColor: '#b88144',
    borderRadius: 16,
    height: 56,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#b88144',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  buttonIcon: {
    marginLeft: 8,
  },
});

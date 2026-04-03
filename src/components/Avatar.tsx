/**
 * Avatar — Foto de perfil com borda gradiente (ou iniciais como fallback)
 */

import React from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme, fontFamily, fontSize } from '@/theme';
import { getInitials } from '@/utils/helpers';
import { BASE_URL } from '@env';

interface AvatarProps {
  imageUrl?: string | null;
  name: string;
  size?: number;
  showBorder?: boolean;
}

const Avatar: React.FC<AvatarProps> = ({
  imageUrl,
  name,
  size = 48,
  showBorder = true,
}) => {
  const { colors } = useTheme();
  const borderWidth = showBorder ? 2 : 0;
  const gradientSize = size + borderWidth * 2 + 4;
  const innerSize = size;

  // Construir URL completa da imagem (a API retorna path relativo)
  const fullImageUrl = imageUrl
    ? imageUrl.startsWith('http')
      ? imageUrl
      : `${BASE_URL.replace('/api', '')}${imageUrl}`
    : null;

  const content = fullImageUrl ? (
    <Image
      source={{ uri: fullImageUrl }}
      style={[
        styles.image,
        {
          width: innerSize,
          height: innerSize,
          borderRadius: innerSize / 2,
          borderWidth: borderWidth,
          borderColor: colors.background,
        },
      ]}
    />
  ) : (
    <View
      style={[
        styles.fallback,
        {
          width: innerSize,
          height: innerSize,
          borderRadius: innerSize / 2,
          backgroundColor: colors.brandPurpleLight,
          borderWidth: borderWidth,
          borderColor: colors.background,
        },
      ]}
    >
      <Text
        style={[
          styles.initials,
          {
            color: colors.brandPurple,
            fontFamily: fontFamily.bold,
            fontSize: innerSize * 0.35,
          },
        ]}
      >
        {getInitials(name)}
      </Text>
    </View>
  );

  if (!showBorder) return content;

  return (
    <LinearGradient
      colors={[colors.brandPurple, colors.brandGreen]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[
        styles.gradient,
        {
          width: gradientSize,
          height: gradientSize,
          borderRadius: gradientSize / 2,
        },
      ]}
    >
      {content}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 2,
  },
  image: {
    resizeMode: 'cover',
  },
  fallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    textAlign: 'center',
  },
});

export default Avatar;

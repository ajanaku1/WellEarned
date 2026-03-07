import { Image } from 'react-native';

export default function WellEarnedLogo({ size = 64 }: { size?: number }) {
  return (
    <Image
      source={require('../../assets/img.png')}
      style={{ width: size, height: size, borderRadius: size * 0.22 }}
      resizeMode="contain"
    />
  );
}

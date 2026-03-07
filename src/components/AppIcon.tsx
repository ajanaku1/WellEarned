import Svg, { Path } from 'react-native-svg';
import { palette } from '@/theme/tokens';

type Props = {
  name: 'home' | 'log' | 'rewards' | 'insights' | 'profile';
  active?: boolean;
  size?: number;
};

export default function AppIcon({ name, active = false, size = 22 }: Props) {
  const color = active ? palette.brand : palette.inkMuted;
  const fill = active ? `${palette.brand}25` : 'none';
  const sw = 1.8;

  if (name === 'home') {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path d="M3 10.5L12 3l9 7.5V20a1.5 1.5 0 01-1.5 1.5h-15A1.5 1.5 0 013 20v-9.5z" stroke={color} strokeWidth={sw} fill={fill} strokeLinejoin="round" />
        <Path d="M9 21V14h6v7" stroke={color} strokeWidth={sw} strokeLinejoin="round" />
      </Svg>
    );
  }
  if (name === 'log') {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path d="M12 12m-9 0a9 9 0 1018 0 9 9 0 10-18 0" stroke={color} strokeWidth={sw} fill={fill} />
        <Path d="M12 5v14M5 12h14" stroke={color} strokeWidth={2.2} strokeLinecap="round" />
      </Svg>
    );
  }
  if (name === 'rewards') {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path d="M12 2L14.9 8.6l7.1.6-5.4 4.6 1.7 6.9L12 17.3 5.7 20.7l1.7-6.9L2 9.2l7.1-.6L12 2z" stroke={color} strokeWidth={sw} fill={fill} strokeLinejoin="round" />
      </Svg>
    );
  }
  if (name === 'insights') {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path d="M6 20V10" stroke={color} strokeWidth={2.5} strokeLinecap="round" />
        <Path d="M12 20V4" stroke={color} strokeWidth={2.5} strokeLinecap="round" />
        <Path d="M18 20V14" stroke={color} strokeWidth={2.5} strokeLinecap="round" />
      </Svg>
    );
  }
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 12a4.5 4.5 0 100-9 4.5 4.5 0 000 9z" stroke={color} strokeWidth={sw} fill={fill} />
      <Path d="M4 20c0-3.3 3.6-6 8-6s8 2.7 8 6" stroke={color} strokeWidth={sw} strokeLinecap="round" />
    </Svg>
  );
}

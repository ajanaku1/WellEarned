import { ActivityIndicator, Text, View } from 'react-native';

export const LoadingView = ({ label = 'Loading...' }: { label?: string }) => (
  <View style={{ padding: 24, alignItems: 'center' }}>
    <ActivityIndicator size="small" color="#0EA5E9" />
    <Text style={{ marginTop: 8, color: '#475569' }}>{label}</Text>
  </View>
);

export const ErrorView = ({ message }: { message: string }) => (
  <View style={{ padding: 12, borderRadius: 12, backgroundColor: '#fee2e2' }}>
    <Text style={{ color: '#b91c1c' }}>{message}</Text>
  </View>
);

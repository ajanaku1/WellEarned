import { useEffect, useState } from 'react';
import { Alert, Linking, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/context/AuthContext';
import { useWallet } from '@/context/WalletContext';
import { getAddressExplorerUrl } from '@/services/solanaProgram';
import { checkSMSCapabilities, SMSCapabilities } from '@/services/sms';
import { palette, gradient, radius, spacing, type, shadow, card, glowCard, button, row } from '@/theme/tokens';

const truncate = (address: string) => `${address.slice(0, 6)}...${address.slice(-4)}`;

export default function ProfileScreen() {
  const { user, isGuest, logout } = useAuth();
  const {
    walletAddress,
    balance,
    tokenBalance,
    connecting,
    demoMode,
    connect,
    disconnect,
    refreshBalances,
    requestAirdrop,
  } = useWallet();
  const [airdropping, setAirdropping] = useState(false);
  const [smsCapabilities, setSmsCapabilities] = useState<SMSCapabilities | null>(null);

  useEffect(() => {
    checkSMSCapabilities().then(setSmsCapabilities).catch(() => {});
  }, []);

  const initial = isGuest ? 'G' : (user?.email || '?')[0].toUpperCase();
  const displayName = isGuest ? 'Guest User' : (user?.email || 'No email');

  const handleAirdrop = async () => {
    setAirdropping(true);
    try {
      await requestAirdrop();
    } finally {
      setAirdropping(false);
    }
  };

  const openAddressExplorer = () => {
    if (!walletAddress) return;
    Linking.openURL(getAddressExplorerUrl(walletAddress));
  };

  return (
    <View style={{ flex: 1, backgroundColor: palette.bg }}>
      <View style={{ position: 'absolute', top: -30, right: -30, width: 140, height: 140, borderRadius: 70, backgroundColor: 'rgba(123,175,142,0.05)' }} />

      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: spacing.x5, gap: spacing.x5, paddingBottom: 100 }}>
          <Text style={{ fontSize: type.title, fontWeight: '700', color: palette.ink, letterSpacing: -0.3 }}>Profile</Text>

          {/* User Card */}
          <View style={{ ...card, alignItems: 'center', gap: spacing.x5 }}>
            <View style={{ borderRadius: 40, overflow: 'hidden', ...shadow.softGlow(palette.brand) }}>
              <LinearGradient colors={gradient.calm} style={{ width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: 30, fontWeight: '700', color: '#fff' }}>{initial}</Text>
              </LinearGradient>
            </View>
            <View style={{ alignItems: 'center', gap: 4 }}>
              <Text style={{ color: palette.ink, fontSize: type.subtitle, fontWeight: '600' }}>{displayName}</Text>
              {isGuest ? (
                <View style={{ backgroundColor: palette.amberSurface, paddingHorizontal: spacing.x3, paddingVertical: 3, borderRadius: radius.pill }}>
                  <Text style={{ color: palette.amber, fontSize: type.micro, fontWeight: '600' }}>GUEST MODE</Text>
                </View>
              ) : (
                <Text style={{ color: palette.inkMuted, fontSize: type.caption }}>
                  {user?.uid ? `ID: ${user.uid.slice(0, 12)}...` : 'n/a'}
                </Text>
              )}
            </View>
          </View>

          {/* Wallet Section */}
          <View style={{ ...card, gap: spacing.x4 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.x3 }}>
                <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: palette.solanaGlow, alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ color: palette.solana, fontWeight: '700', fontSize: 16 }}>S</Text>
                </View>
                <Text style={{ fontSize: type.subtitle, fontWeight: '700', color: palette.ink }}>Solana Wallet</Text>
              </View>
              {demoMode && (
                <View style={{ backgroundColor: palette.amberSurface, paddingHorizontal: spacing.x2, paddingVertical: 2, borderRadius: radius.pill }}>
                  <Text style={{ color: palette.amber, fontSize: type.micro, fontWeight: '600' }}>DEMO</Text>
                </View>
              )}
            </View>

            {walletAddress ? (
              <View style={{ gap: spacing.x4 }}>
                <Pressable onPress={openAddressExplorer} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: row.standard }}>
                  <Text style={{ color: palette.inkSoft, fontSize: type.caption }}>Address</Text>
                  <Text style={{ color: palette.solana, fontSize: type.caption, fontWeight: '600', textDecorationLine: 'underline' }}>
                    {truncate(walletAddress)}
                  </Text>
                </Pressable>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: row.standard }}>
                  <Text style={{ color: palette.inkSoft, fontSize: type.caption }}>SOL Balance</Text>
                  <Text style={{ color: palette.ink, fontSize: type.caption, fontWeight: '600' }}>
                    {balance !== null ? `${balance.toFixed(4)} SOL` : '...'}
                  </Text>
                </View>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: row.standard }}>
                  <Text style={{ color: palette.inkSoft, fontSize: type.caption }}>SKR Balance</Text>
                  <Text style={{ color: palette.cyan, fontSize: type.caption, fontWeight: '600' }}>
                    {tokenBalance !== null ? `${tokenBalance.toFixed(2)} SKR` : '...'}
                  </Text>
                </View>

                <View style={{ flexDirection: 'row', gap: spacing.x3 }}>
                  <Pressable
                    onPress={handleAirdrop}
                    disabled={airdropping}
                    style={({ pressed }) => ({
                      flex: 1,
                      borderRadius: radius.lg,
                      overflow: 'hidden',
                      opacity: airdropping ? 0.5 : pressed ? 0.85 : 1,
                    })}
                  >
                    <LinearGradient
                      colors={gradient.brand}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={{ paddingVertical: button.md, borderRadius: radius.lg, alignItems: 'center' }}
                    >
                      <Text style={{ color: '#fff', fontWeight: '600', fontSize: type.caption }}>
                        {airdropping ? 'Requesting...' : 'Airdrop 1 SOL'}
                      </Text>
                    </LinearGradient>
                  </Pressable>

                  <Pressable
                    onPress={refreshBalances}
                    style={({ pressed }) => ({
                      flex: 1,
                      backgroundColor: 'rgba(240,237,232,0.04)',
                      borderWidth: 0.5,
                      borderColor: 'rgba(240,237,232,0.08)',
                      borderRadius: radius.lg,
                      paddingVertical: button.md,
                      alignItems: 'center',
                      opacity: pressed ? 0.7 : 1,
                    })}
                  >
                    <Text style={{ color: palette.inkSoft, fontWeight: '600', fontSize: type.caption }}>
                      Refresh
                    </Text>
                  </Pressable>
                </View>

                <Pressable
                  onPress={disconnect}
                  style={({ pressed }) => ({
                    backgroundColor: palette.dangerGlow,
                    borderWidth: 0.5,
                    borderColor: 'rgba(207,113,113,0.25)',
                    borderRadius: radius.lg,
                    paddingVertical: button.md,
                    opacity: pressed ? 0.7 : 1,
                  })}
                >
                  <Text style={{ color: palette.danger, textAlign: 'center', fontWeight: '600', fontSize: type.caption }}>Disconnect Wallet</Text>
                </Pressable>
              </View>
            ) : (
              <View style={{ gap: spacing.x3 }}>
                <Pressable
                  onPress={connect}
                  disabled={connecting}
                  style={({ pressed }) => ({ borderRadius: radius.lg, overflow: 'hidden', opacity: connecting ? 0.5 : pressed ? 0.85 : 1 })}
                >
                  <LinearGradient colors={gradient.brand} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ paddingVertical: button.lg, borderRadius: radius.lg }}>
                    <Text style={{ color: '#fff', textAlign: 'center', fontWeight: '700', fontSize: type.body }}>
                      {connecting ? 'Connecting...' : 'Connect Wallet'}
                    </Text>
                  </LinearGradient>
                </Pressable>
                <Text style={{ color: palette.inkMuted, fontSize: type.caption, textAlign: 'center' }}>Phantom, Solflare, and MWA-compatible wallets</Text>
              </View>
            )}
          </View>

          {/* App Info */}
          <View style={{ ...card, gap: spacing.x3 }}>
            <Text style={{ fontSize: type.subtitle, fontWeight: '700', color: palette.ink }}>About</Text>
            {[
              { label: 'Version', value: '1.0.0', color: palette.ink },
              { label: 'AI Engine', value: 'Gemini', color: palette.lavender },
              { label: 'Blockchain', value: 'Solana', color: palette.solana },
              { label: 'Hackathon', value: 'Seeker', color: palette.cyan },
            ].map(({ label, value, color }) => (
              <View key={label} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: row.compact }}>
                <Text style={{ color: palette.inkSoft, fontSize: type.caption }}>{label}</Text>
                <Text style={{ color, fontSize: type.caption, fontWeight: '600' }}>{value}</Text>
              </View>
            ))}
          </View>

          {/* SMS Status */}
          <View style={{ ...card, gap: spacing.x3 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.x3 }}>
              <Text style={{ fontSize: type.subtitle, fontWeight: '700', color: palette.ink }}>Solana Mobile Stack</Text>
              <View style={{ backgroundColor: palette.brandSurface, paddingHorizontal: spacing.x2, paddingVertical: 2, borderRadius: radius.pill }}>
                <Text style={{ color: palette.brandLight, fontSize: type.micro, fontWeight: '600' }}>SMS</Text>
              </View>
            </View>
            {[
              { label: 'Mobile Wallet Adapter', available: smsCapabilities?.hasMWA ?? false },
              { label: 'Seed Vault', available: smsCapabilities?.hasSeedVault ?? false },
              { label: 'dApp Store Ready', available: true },
            ].map(({ label, available }) => (
              <View key={label} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: row.compact }}>
                <Text style={{ color: palette.inkSoft, fontSize: type.caption }}>{label}</Text>
                <Text style={{ color: available ? palette.mint : palette.inkMuted, fontSize: type.caption, fontWeight: '600' }}>
                  {available ? 'Available' : 'Not Detected'}
                </Text>
              </View>
            ))}
            {smsCapabilities?.walletName && (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: row.compact }}>
                <Text style={{ color: palette.inkSoft, fontSize: type.caption }}>Wallet App</Text>
                <Text style={{ color: palette.cyan, fontSize: type.caption, fontWeight: '600' }}>{smsCapabilities.walletName}</Text>
              </View>
            )}
          </View>

          {/* Logout */}
          <Pressable
            onPress={logout}
            style={({ pressed }) => ({
              backgroundColor: 'rgba(240,237,232,0.03)',
              borderWidth: 0.5,
              borderColor: 'rgba(240,237,232,0.06)',
              borderRadius: radius.lg,
              paddingVertical: button.lg,
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <Text style={{ color: palette.danger, textAlign: 'center', fontWeight: '600', fontSize: type.body }}>Log Out</Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

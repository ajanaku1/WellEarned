import { C } from '../constants';

type Props = {
  label: string;
  color?: string;
  icon?: string;
};

export const FeatureBadge: React.FC<Props> = ({ label, color = C.brand, icon }) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      padding: '8px 18px',
      borderRadius: 999,
      background: `${color}15`,
      border: `1px solid ${color}30`,
    }}
  >
    {icon && <span style={{ fontSize: 16 }}>{icon}</span>}
    <span style={{ color, fontSize: 14, fontWeight: 600, fontFamily: 'system-ui' }}>{label}</span>
  </div>
);

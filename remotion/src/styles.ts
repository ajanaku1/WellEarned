import { CSSProperties } from 'react';
import { C } from './constants';

export const fullScreen: CSSProperties = {
  width: '100%',
  height: '100%',
  position: 'absolute',
  top: 0,
  left: 0,
};

export const center: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

export const column: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
};

export const row: CSSProperties = {
  display: 'flex',
  flexDirection: 'row',
};

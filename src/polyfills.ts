import 'react-native-get-random-values';
import { Buffer } from 'buffer';
import process from 'process';

const g = globalThis as typeof globalThis & {
  Buffer?: typeof Buffer;
  process?: typeof process;
};

g.Buffer = g.Buffer || Buffer;
g.process = g.process || process;

import { useState } from 'react';
import type { AppProps } from '../desktop/types';
import { PALETTES, TerminalView } from './terminal/TerminalView';
import type { ThemeName } from './terminal/engine';

export default function Terminal(_props: AppProps) {
  const [theme, setTheme] = useState<ThemeName>('purple');
  return <TerminalView palette={PALETTES[theme]} onTheme={setTheme} autoFocus />;
}

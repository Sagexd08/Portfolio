import { useId, type ReactNode } from 'react';
import { GLYPHS_A } from './iconGlyphsA';
import { GLYPHS_B } from './iconGlyphsB';
import { IconTile, type IconDef } from './iconKit';
import type { AppId } from './types';

// Original squircle app icons, drawn as layered SVG (superellipse tile, gradients, specular highlight, rim). No third-party artwork.

const ALL: Record<string, IconDef> = { ...GLYPHS_A, ...GLYPHS_B };

function AppIcon({ name }: { name: string }) {
  const uid = useId();
  return <IconTile def={ALL[name]} uid={uid} />;
}

const render = (name: string): ReactNode => <AppIcon key={name} name={name} />;

export const APP_ICONS = Object.fromEntries(
  (Object.keys(ALL) as string[]).filter((name) => !['launchpad', 'trash', 'settings'].includes(name)).map((name) => [name, render(name)]),
) as Record<AppId, ReactNode>;

/** Dock-only icons that are not apps. */
export const LAUNCHPAD_ICON = render('launchpad');
export const TRASH_ICON = render('trash');
export const SETTINGS_ICON = render('settings');

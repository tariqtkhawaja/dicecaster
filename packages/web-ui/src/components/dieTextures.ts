import { DieType } from '@dicecaster/react';
import { DIE_CONFIGS, getSides } from './dieConfigs';

export function createDieTexture(dieType: DieType, faceValue: number): HTMLCanvasElement {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const colors = DIE_CONFIGS[dieType].colors;

  ctx.fillStyle = colors.bg;
  ctx.fillRect(0, 0, size, size);

  ctx.strokeStyle = 'rgba(255,255,255,0.3)';
  ctx.lineWidth = 8;
  ctx.strokeRect(16, 16, size - 32, size - 32);

  ctx.fillStyle = colors.text;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const sides = getSides(dieType);
  const fontSize = sides > 9 ? 140 : 180;
  ctx.font = `bold ${fontSize}px system-ui, sans-serif`;
  ctx.fillText(String(faceValue), size / 2, size / 2);

  return canvas;
}

import { ImageResponse } from 'next/og';

export const alt = 'Engineering Mastery Academy — Senior Software Engineering';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', width: '100%', height: '100%', padding: 80, background: 'linear-gradient(135deg,#0b1020,#1c2351 60%,#101b30)', color: '#ffffff', fontFamily: 'sans-serif' }}>
        <div style={{ display: 'flex', alignItems: 'center', fontSize: 29, letterSpacing: 5, color: '#a6b7ff' }}>ENGINEERING MASTERY</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
          <div style={{ fontSize: 74, fontWeight: 800, lineHeight: 1.1 }}>Learn deeply.
Think like a senior.</div>
          <div style={{ fontSize: 29, color: '#c4cee9' }}>1,012 questions · 198 topics · 18 engineering tracks</div>
        </div>
        <div style={{ display: 'flex', fontSize: 24, color: '#a6b7ff' }}>TR / EN · Developed by ccankaya</div>
      </div>
    ), size,
  );
}

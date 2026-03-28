import { ImageResponse } from 'next/og'

export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#2563eb',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '6px',
        }}
      >
        <svg width="22" height="28" viewBox="0 0 22 28" fill="none">
          {/* hlava */}
          <circle cx="11" cy="4" r="3" fill="white" />
          {/* telo */}
          <line x1="11" y1="7" x2="11" y2="17" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
          {/* ruce - leva ruka hore (lezi na stene), prava dole */}
          <line x1="11" y1="10" x2="4" y2="7" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
          <line x1="11" y1="12" x2="17" y2="14" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
          {/* nohy */}
          <line x1="11" y1="17" x2="6" y2="26" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
          <line x1="11" y1="17" x2="16" y2="24" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
      </div>
    ),
    { ...size }
  )
}

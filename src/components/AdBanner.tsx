import { useEffect, useRef } from 'react'

interface AdBannerProps {
  /** Ad slot ID from Google AdSense */
  slot: string
  /** Ad format (auto, horizontal, vertical, rectangle) */
  format?: 'auto' | 'horizontal' | 'vertical' | 'rectangle'
  /** Enable responsive ad sizing */
  responsive?: boolean
  /** Custom CSS classes */
  className?: string
  /** Ad container style */
  style?: React.CSSProperties
}

declare global {
  interface Window {
    adsbygoogle: any[]
  }
}

/**
 * Google AdSense banner component
 * Integrates seamlessly with app aesthetic using card-style container
 */
export const AdBanner: React.FC<AdBannerProps> = ({
  slot,
  format = 'auto',
  responsive = true,
  className = '',
  style = {}
}) => {
  const adRef = useRef<HTMLModElement>(null)
  const isAdLoaded = useRef(false)

  useEffect(() => {
    // Only push to adsbygoogle once per mount
    if (adRef.current && !isAdLoaded.current) {
      try {
        // Initialize adsbygoogle array if it doesn't exist
        window.adsbygoogle = window.adsbygoogle || []
        window.adsbygoogle.push({})
        isAdLoaded.current = true
      } catch (error) {
        console.error('AdSense error:', error)
      }
    }
  }, [])

  return (
    <div
      className={`ad-container rounded-lg border border-gray-200 bg-white p-4 ${className}`}
      style={style}
    >
      {/* Subtle label for transparency */}
      <div className="text-xs text-gray-400 mb-2 text-center">Advertisement</div>

      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{
          display: 'block',
          minHeight: '100px',
          ...style
        }}
        data-ad-client="ca-pub-5581720231280472"
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive ? 'true' : 'false'}
      />
    </div>
  )
}

/**
 * Responsive display ad - good for content areas
 */
export const AdDisplay: React.FC<{ slot: string }> = ({ slot }) => (
  <AdBanner
    slot={slot}
    format="auto"
    responsive={true}
    className="my-6"
  />
)

/**
 * Horizontal banner ad - good for top/bottom of pages
 */
export const AdHorizontalBanner: React.FC<{ slot: string }> = ({ slot }) => (
  <AdBanner
    slot={slot}
    format="horizontal"
    responsive={true}
    className="my-4"
    style={{ minHeight: '90px' }}
  />
)

/**
 * Small rectangle ad - good for sidebars or between content
 */
export const AdRectangle: React.FC<{ slot: string }> = ({ slot }) => (
  <AdBanner
    slot={slot}
    format="rectangle"
    responsive={true}
    className="my-4"
    style={{ maxWidth: '336px', margin: '0 auto' }}
  />
)

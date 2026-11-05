/**
 * ASIAN OUD — Pure International Partner Logos Slider
 * Lightweight CSS continuous marquee controller with hover & touch interaction
 */

export function initShippingSlider() {
  const wrap = document.getElementById('shippingLogoMarqueeWrap')
  const track = document.getElementById('shippingLogoTrack')
  if (!wrap || !track) return

  // Smooth hover pause
  wrap.onmouseenter = () => {
    track.style.animationPlayState = 'paused'
  }

  wrap.onmouseleave = () => {
    track.style.animationPlayState = 'running'
  }

  // Smooth touch pause on mobile
  wrap.ontouchstart = () => {
    track.style.animationPlayState = 'paused'
  }

  wrap.ontouchend = () => {
    setTimeout(() => {
      track.style.animationPlayState = 'running'
    }, 1200)
  }
}

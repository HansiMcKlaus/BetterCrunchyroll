(function () {
  'use strict'

  // Default values
  let stepSize = 5
  let showRecommendationCarousel = true
  let seekPreviewScale = 1

  browser.storage.local.get({ stepSize: 5, showRecommendationCarousel: true, seekPreviewScale: 1 }, (result) => {
    stepSize = result.stepSize
    showRecommendationCarousel = result.showRecommendationCarousel
    seekPreviewScale = result.seekPreviewScale
    document.documentElement.style.setProperty('--seek-preview-scale', seekPreviewScale)
  })

  // Automatically updates settings without having to reload the page
  browser.storage.onChanged.addListener((changes, area) => {
    if (area !== 'local') return
    if (changes.stepSize) stepSize = changes.stepSize.newValue
    if (changes.showRecommendationCarousel) showRecommendationCarousel = changes.showRecommendationCarousel.newValue
    if (changes.seekPreviewScale) {
      seekPreviewScale = changes.seekPreviewScale.newValue
      document.documentElement.style.setProperty('--seek-preview-scale', seekPreviewScale)
    }
  })

  // Do not trigger on input/text fields or on other key presses
  function isEditableTarget(el) {
    if (!el) return false
    const tag = el.tagName.toLowerCase()
    return tag === 'input' || tag === 'textarea' || el.isContentEditable
  }

  
  window.addEventListener('keydown', (e) => {
    if (isEditableTarget(e.target)) return

    const isSeek = e.key === 'ArrowLeft' || e.key === 'ArrowRight'
    const isFrame = e.key === ',' || e.key === '.'
    if (!isSeek && !isFrame) return

    const video = document.querySelector('video')
    if (!video) return

    // Overwrite default seek behavior
    e.stopImmediatePropagation()
    e.stopPropagation()
    e.preventDefault()

    if (isSeek) {
      const delta = e.key === 'ArrowLeft' ? -stepSize : stepSize
      video.currentTime = Math.max(0, Math.min(video.duration || 0, video.currentTime + delta))
    } else if (isFrame) {
      // Assume a Framerate of 24FPS
      const delta = e.key === ',' ? -(1 / 24) : (1 / 24)
      video.currentTime = Math.max(0, Math.min(video.duration || 0, video.currentTime + delta))
    }
  }, true)

  // Open/Exit Fullscreen on double-click
  window.addEventListener('dblclick', (e) => {
    if (isEditableTarget(e.target)) return
    if (e.target.closest('button, a, [role="button"]')) return
    const fullscreenBtn = document.querySelector('[data-testid="fullscreen-button"]')
    if (!fullscreenBtn) return
    e.preventDefault()
    fullscreenBtn.click()
  }, true)

  // Watch for the end-of-episode banner and close it via its own close button
  new MutationObserver(() => {
    if (showRecommendationCarousel) return
    const closeBtn = document.querySelector('.erc-end-slate-recommendations-carousel button[data-t="close-btn"]')
    if (closeBtn) closeBtn.click()
  }).observe(document.documentElement, { childList: true, subtree: true })
})()

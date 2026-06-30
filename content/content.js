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
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return

    const video = document.querySelector('video')
    if (!video) return

    // Overwrite default seek behavior
    e.stopImmediatePropagation()
    e.stopPropagation()
    e.preventDefault()

    const delta = e.key === 'ArrowLeft' ? -stepSize : stepSize
    video.currentTime = Math.max(0, Math.min(video.duration || 0, video.currentTime + delta))
  }, true)

  // Watch for the end-of-episode banner and close it via its own close button
  function createBannerObserver(watchEpisodeContainer) {
    return new MutationObserver(() => {
      if (showRecommendationCarousel) return
      const banner = watchEpisodeContainer.querySelector('.erc-end-slate-recommendations-carousel')
      if (banner) banner.querySelector('button[data-t="close-btn"]')?.click()
    })
  }

  // Wait for the watch episode container to appear, then attach the banner observer to it
  new MutationObserver((_, containerObserver) => {
    const watchEpisodeContainer = document.querySelector('.erc-watch-episode')
    if (!watchEpisodeContainer) return
    containerObserver.disconnect()
    createBannerObserver(watchEpisodeContainer).observe(watchEpisodeContainer, { childList: true })
  }).observe(document.documentElement, { childList: true, subtree: true })
})()

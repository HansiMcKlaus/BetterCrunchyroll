'use strict'

document.addEventListener('DOMContentLoaded', () => {
  const stepSizeInput = document.getElementById('stepSize')
  const seekPreviewScaleInput = document.getElementById('seekPreviewScale')
  const showRecommendationCarouselToggle = document.getElementById('showRecommendationCarousel')
  const saveButton = document.getElementById('save')

  browser.storage.local.get({ stepSize: 5, seekPreviewScale: 1, showRecommendationCarousel: true }, (result) => {
    stepSizeInput.value = result.stepSize
    seekPreviewScaleInput.value = result.seekPreviewScale
    showRecommendationCarouselToggle.checked = result.showRecommendationCarousel
  })

  const resetButton = () => {
    saveButton.textContent = 'Save'
    saveButton.className = ''
  }

  saveButton.addEventListener('click', () => {
    const stepSize = parseInt(stepSizeInput.value, 10)
    const seekPreviewScale = parseFloat(seekPreviewScaleInput.value)
    if (isNaN(stepSize) || stepSize < 1 || isNaN(seekPreviewScale) || seekPreviewScale < 0.1) {
      saveButton.textContent = 'Invalid input!'
      saveButton.className = 'error'
      setTimeout(resetButton, 1500)
      return
    }
    browser.storage.local.set({ stepSize, seekPreviewScale, showRecommendationCarousel: showRecommendationCarouselToggle.checked }, () => {
      saveButton.textContent = 'Saved!'
      setTimeout(resetButton, 1500)
    })
  })
})

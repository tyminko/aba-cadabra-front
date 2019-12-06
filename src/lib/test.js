$(document).ready(function () {
  var previous
  $('.flip-card').click(function () {
    const cardInner = $(this).find('.flip-card-inner')
    if (cardInner.hasClass('flip-card-transform')) {
      cardInner.removeClass('flip-card-transform')
      clearTimeout(timeout)
    } else {
      cardInner.addClass('flip-card-transform')
      setTimeout(function () {
        cardInner.removeClass('flip-card-transform')
      }, 2000) // set whatever time sutable for you

      // Also as Harun Yilmaz suggested in his comment you don't need previous as an array
      if (previous && previous.hasClass('flip-card-transform')) {
        previous.removeClass('flip-card-transform')
      }
      previous = cardInner
    }
  })
})

$(function() {
  $('.insite-anchor').on('click', function() {
    $('.insite-anchor').removeClass('active');
    $(this).addClass('active');
  })

  $(document).on('scroll', function() {
    var currentPosition = $(this).scrollTop();
    var targetPosition = $('.join-us').position().top - 72;

    var joinUsAnchor = $('#join-us-anchor');
    var teamAnchor = $('#team-anchor');

    if(currentPosition >= targetPosition){
      teamAnchor.removeClass('active');
      joinUsAnchor.addClass('active');
    } else {
      teamAnchor.addClass('active');
      joinUsAnchor.removeClass('active');
    }
  })
})
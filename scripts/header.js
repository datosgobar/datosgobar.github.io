$(function() {
  $('.insite-anchor').on('click', function(event) {
    $('.insite-anchor').removeClass('active');
    $(event.currentTarget).addClass('active');
  })

  var joinUsAnchor = $('#join-us-anchor');
  var teamAnchor = $('#team-anchor');

  $(document).on('scroll', function() {
    var currentPosition = $(this).scrollTop();
    var targetPosition = $('.join-us').position().top - 72;

    if(currentPosition >= targetPosition){
      teamAnchor.removeClass('active');
      joinUsAnchor.addClass('active');
    } else {
      teamAnchor.addClass('active');
      joinUsAnchor.removeClass('active');
    }
  })

  if (window.location && window.location.hash && window.location.hash == '#busquedas-laborales') {
    teamAnchor.removeClass('active');
    joinUsAnchor.addClass('active');
  }
})
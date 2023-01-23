/*
jQuery(window).load(function() {
  $('.preloader').fadeOut('slow');
});
*/

$(window).on('beforeunload', function() {
  $(window).scrollTop(0);
});

window.addEventListener('load', () => {
  const preload = document.querySelector('.preloader');
  const loading = document.querySelector('.loading');
  setTimeout( function() {
      preload.classList.add('preloader-finish');
      loading.classList.remove('loading');
  }, 0 );
});


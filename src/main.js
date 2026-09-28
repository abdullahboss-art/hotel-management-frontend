
import $ from 'jquery';

import 'owl.carousel';
import 'bootstrap-datepicker/dist/css/bootstrap-datepicker.min.css';
import 'bootstrap-datepicker';
import 'bootstrap-timepicker/css/bootstrap-timepicker.min.css';
import 'bootstrap-timepicker';
import AOS from 'aos';
import 'aos/dist/aos.css';


// Initialize AOS after DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  AOS.init({
    duration: 1000
  });
});

// Your jQuery code - wrap in DOM ready
$(document).ready(function() {
  'use strict';

  // Menu toggle functionality
  $('.site-menu-toggle').on('click', function(){
    var $this = $(this);
    if ($('body').hasClass('menu-open')) {
      $this.removeClass('open');
      $('.js-site-navbar').fadeOut(400);
      $('body').removeClass('menu-open');
    } else {
      $this.addClass('open');
      $('.js-site-navbar').fadeIn(400);
      $('body').addClass('menu-open');
    }
  });

  // Dropdown hover functionality
  $('nav .dropdown').on({
    mouseenter: function(){
      var $this = $(this);
      $this.addClass('show');
      $this.find('> a').attr('aria-expanded', true);
      $this.find('.dropdown-menu').addClass('show');
    },
    mouseleave: function(){
      var $this = $(this);
      $this.removeClass('show');
      $this.find('> a').attr('aria-expanded', false);
      $this.find('.dropdown-menu').removeClass('show');
    }
  });

  // Owl Carousel Initializations
  if ($('.home-slider').length) {
    $('.home-slider').owlCarousel({
      loop: true,
      autoplay: true,
      margin: 10,
      animateOut: 'fadeOut',
      animateIn: 'fadeIn',
      nav: true,
      autoplayHoverPause: true,
      items: 1,
      autoHeight: true,
      navText: ["<span class='ion-chevron-left'></span>","<span class='ion-chevron-right'></span>"],
      responsive: {
        0: { items: 1, nav: false },
        600: { items: 1, nav: false },
        1000: { items: 1, nav: true }
      }
    });
  }

  // Carousel 1
  if ($('.js-carousel-1').length) {
    $('.js-carousel-1').owlCarousel({
      loop: true,
      autoplay: true,
      stagePadding: 7,
      margin: 20,
      animateOut: 'fadeOut',
      animateIn: 'fadeIn',
      nav: true,
      autoplayHoverPause: true,
      items: 3,
      navText: ["<span class='ion-chevron-left'></span>","<span class='ion-chevron-right'></span>"],
      responsive: {
        0: { items: 1, nav: false },
        600: { items: 2, nav: false },
        1000: { items: 3, nav: true, loop: false }
      }
    });
  }

  // Carousel 2
  if ($('.js-carousel-2').length) {
    $('.js-carousel-2').owlCarousel({
      loop: true,
      autoplay: true,
      stagePadding: 7,
      margin: 20,
      nav: true,
      autoplayHoverPause: true,
      autoHeight: true,
      items: 3,
      navText: ["<span class='ion-chevron-left'></span>","<span class='ion-chevron-right'></span>"],
      responsive: {
        0: { items: 1, nav: false },
        600: { items: 2, nav: false },
        1000: { items: 3, dots: true, nav: true, loop: false }
      }
    });
  }

  // Stellar.js initialization
  if (typeof $.stellar !== 'undefined') {
    $(window).stellar({
      responsive: false,
      parallaxBackgrounds: true,
      parallaxElements: true,
      horizontalScrolling: false,
      hideDistantElements: false,
      scrollProperty: 'scroll'
    });
  }

  // Smooth scroll
  $('a.smoothscroll[href^="#"]').on('click', function(e) {
    e.preventDefault();
    var target = $(this).attr('href');
    if (target !== '#') {
      $('html, body').animate({
        scrollTop: $(target).offset().top
      }, 500);
    }
  });

  // Date and time pickers
  if ($('#m_date').length) {
    $('#m_date').datepicker({
      format: 'm/d/yyyy',
      autoclose: true
    });
  }
  
  if ($('#checkin_date').length || $('#checkout_date').length) {
    $('#checkin_date, #checkout_date').datepicker({
      format: 'd MM, yyyy',
      autoclose: true
    });
  }
  
  if ($('#m_time').length) {
    $('#m_time').timepicker();
  }

  // Window scroll - header effect
  var $header = $('.js-site-header');
  $(window).on('scroll', function() {
    if ($(this).scrollTop() > 200) {
      $header.addClass('scrolled');
    } else {
      $header.removeClass('scrolled');
    }
  });

  // Go to top button
  $('.js-gotop').on('click', function(e) {
    e.preventDefault();
    $('html, body').animate({
      scrollTop: 0
    }, 500, 'easeInOutExpo');
  });

  $(window).on('scroll', function() {
    if ($(this).scrollTop() > 200) {
      $('.js-top').addClass('active');
    } else {
      $('.js-top').removeClass('active');
    }
  });
});
var isMobile = false
$(document).ready(function () {
   isMobile = window.matchMedia("only screen and (max-width: 760px)").matches;

   if (!isMobile) {
      console.log('doing it')
      $('#ad1').html('<iframe data-aa="1259137" src="//ad.a-ads.com/1259137?size=728x90" scrolling="no" style="width:728px; height:90px; border:0px; padding:0; overflow:hidden" allowtransparency="true"></iframe>')
   }

})



$('.menu-toggle').click(function () {
   $(".nav").toggleClass("mobile-nav");
   $(this).toggleClass("is-active");
   if ($('#filepond-container').hasClass('filepond-container-behind')) {
      setTimeout(function () {
         $('#filepond-container').toggleClass('filepond-container-behind')
      }, 800);
   }
   else {
      $('#filepond-container').toggleClass('filepond-container-behind')
   }
});

$("#search-icon").click(function () {
   $(".nav").toggleClass("search");
   $(".nav").toggleClass("no-search");
   $(".search-input").toggleClass("search-active");
});

function resizeGridItem(item) {
   grid = document.getElementsByClassName("grid")[0];
   rowHeight = parseInt(window.getComputedStyle(grid).getPropertyValue('grid-auto-rows'));
   rowGap = parseInt(window.getComputedStyle(grid).getPropertyValue('grid-row-gap'));
   rowSpan = Math.ceil((item.querySelector('.content').getBoundingClientRect().height + rowGap) / (rowHeight + rowGap));
   item.style.gridRowEnd = "span " + rowSpan;
}

function resizeAllGridItems() {
   allItems = document.getElementsByClassName("item");
   for (x = 0; x < allItems.length; x++) {
      resizeGridItem(allItems[x]);
   }
}

function resizeInstance(instance) {
   item = instance.elements[0];
   resizeGridItem(item);
}

window.addEventListener("resize", resizeAllGridItems);

allItems = document.getElementsByClassName("item");
for (x = 0; x < allItems.length; x++) {
   imagesLoaded(allItems[x], resizeInstance);
}

$(document).ready(function () {
   setLogInButton()
});

function setLogInButton() {
   if ($('#logInStatus').hasClass('loggedIn')) {
      $('#logInStatus').attr("href", "/noauth/logout")
      $('#logInStatus').text('Log Out')

   }
}

function getExtension(filename) {
   var parts = filename.split('.');
   return parts[parts.length - 1];
}
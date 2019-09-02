var infScroll = new InfiniteScroll('.grid', {
   path: function () {
      return './noauth/topPosts/' + this.pageIndex;
   },
   // load response as flat text
   responseType: 'text',
   status: '.page-load-status',
   history: false,
   // maybe this should be disabled? histoy^ to get it to go back to the same part of the page
});

infScroll.on('load', function (response) {
   var data = JSON.parse(response);
   data.forEach(element => {
      $(".grid").append('<div id="photoCard' + x + '" class="item photo"> <div class="content"> <div class="title"> <h3>' + element.title + '</h3> </div> <img class="photothumb" src="/noauth/image/' + element.fileName + '"> <div class="desc"> <p>Views: ' + element.views + '</p> </div> </div> </div>')

      allItems = document.getElementsByClassName("item");
      for (x = 0; x < allItems.length; x++) {
         imagesLoaded(allItems[x], resizeInstance);
      }
   });
});

infScroll.loadNextPage();

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
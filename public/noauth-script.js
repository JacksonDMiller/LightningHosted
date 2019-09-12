var infScroll = new InfiniteScroll('.grid', {
   path: function () {
      return '/noauth/topPosts/' + this.pageIndex;
   },
   // load response as flat text
   responseType: 'text',
   status: '.page-load-status',
   history: false,
   // maybe this should be disabled? histoy^ to get it to go back to the same part of the page
});

infScroll.on('load', function (response) {
   if(!localStorage.getItem("upVoted")){
      localStorage.setItem("upVoted", JSON.stringify({}))
   }
   var upVoted = JSON.parse(localStorage.getItem("upVoted"))
   var data = JSON.parse(response);
   console.log(upVoted)
   data.forEach(element => { 
      var voted = 'notUpvoted'+element.id
      if(upVoted[element.id] === true){
         var voted ="upVoted"
      }
      $(".grid").append( `<div id="photoCard` + x + `" class="item photo" style="display:none">
      <div class="content"> 
      <div class="title"> <h3>` + element.title + `</h3> </div> 
      <a href="/noauth/share/`+element.fileName+`">
     <img onload="$('#photoCard` + x + `').css('display', '')" class="photothumb" src="/noauth/image/` + element.fileName + `"> 
     </a>
      <div class="descNoAuth"> 
      <p>Views: ` + element.views + `</p>
      <p>Upvotes: <span id="upvotes`+element.id+`" >` + element.upVotes + `</span> <button class="upVotebtn" onclick="upvoteImage('`+ element.id + `')"><span class="chevron top `+voted+`"></span></button></p>
      </div> </div> </div>`)

      allItems = document.getElementsByClassName("item");
      for (x = 0; x < allItems.length; x++) {
         imagesLoaded(allItems[x], resizeInstance);
      }
   });
   if (data != false) {
   $(".grid").append( `<div id="photoCard` + x + `" class="item photo">
   <div class="content"> 
   <div class="title"> <h3>Sponsor</h3> </div>
   <div class="ads"> 
   <iframe data-aa="1241606" src="//ad.a-ads.com/1241606?size=300x250" scrolling="no" style="width:300px; height:250px; border:0px; padding:0; overflow:hidden" allowtransparency="true"></iframe>
   </div>
   <div class="desc"> 
   </div> </div> </div>`)


   allItems = document.getElementsByClassName("item");
   for (x = 0; x < allItems.length; x++) {
      imagesLoaded(allItems[x], resizeInstance);
   }
}


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

function upvoteImage (id) {
   $.get("/noauth/upvote/" + id, function (data, status) {
      if(data === 'Upvoted'){
         $('#upvotes'+id).text(parseInt($('#upvotes'+id).text())+1)
         $('.notUpvoted'+id).fadeOut(500, function() {
         $('.notUpvoted'+id).css("color", "#000000").fadeIn(500);
         var upVoted = JSON.parse(localStorage.getItem("upVoted"))
         upVoted[id]=true;
         localStorage.setItem("upVoted", JSON.stringify(upVoted));
        });
      }
  });
}

// testing

// TODO: change the transition direction of work panel
$("#divider").click(function() {
  var life = d3.select("#life");
  var work = d3.select("#work");
  var divider = d3.select("#divider");
  var fading = 500;
  var dura = 3000;

  if (life.style("width") == "0px") {  /* display life */

    divider.style("float", "right");

    $("#work").children().fadeOut(fading);
    work.transition().duration(dura).style("width", "0px");
    life.transition().duration(dura).style("width", "960px");

    $("#divider").fadeTo(dura / 2, 0.4, function() {
      divider.style("background-image", "url('images/bg-repeat-life-bar.png')");
    });
    $("#divider").fadeTo(dura / 2, 1, function() {
      $("#life").children().fadeIn(fading);

      init_life();
    });
  } else {  /* display work */

    divider.style("float", "left");

    $("#life").children().fadeOut(fading);
    life.transition().duration(dura).style("width", "0px");
    work.transition().duration(dura).style("width", "960px");

    $("#divider").fadeTo(dura / 2, 0.4, function() {
      divider.style("background-image", "url('images/bg-repeat-work-bar.jpg')");
    });
    $("#divider").fadeTo(dura / 2, 1, function() {
      $("#work").children().fadeIn(fading);
    });
  }
});


function load_book_list() {
  // TODO: add loading bar in the beginning and while retrieving book image
  var uid = "45816769";
  var book_collection_url = "https://api.douban.com/v2/book/user/"+uid+"/collections";
  var book_url = "http://book.douban.com/subject/";

  function gen_book_detail(collection) {
    $("div#book-detail .panel-heading").html(collection.book.title + "<br/>");

    d3.select("div#book-detail .panel-heading").selectAll()
      .data(collection.tags)
      .enter().append("span")
      .classed("badge", true)
      .text(function(d) {return d;});

    d3.select("div#book-detail .media a")
      .attr("href", book_url+collection.book_id)

    d3.select("div#book-detail .media-object")
      .attr("src", collection.book.images.large);

    $("div#book-detail .panel-body .media-body").text(collection.book.summary);

    if (collection.comment) {
      $("div#book-detail #comment").css("display", "block");
      $("div#book-detail #comment").text(collection.comment);
    } else {
      $("div#book-detail #comment").css("display", "none");
    }
  }

  function gen_book_list(ul_selection, collections) {
    ul_selection.selectAll()
      .data(collections)
      .enter().append("li")
      .classed("list-group-item", true)
      .text(function(collection) {
        return collection.book.title + " (" + collection.book.author + ")";
      })
      .style("cursor", "pointer")
      .on("mouseover", function() {
        this.classList.add("text-info");
      })
      .on("mouseout", function() {
        this.classList.remove("text-info");
      })
      .on("click", function(collection) {
        gen_book_detail(collection);
      });
  }

  $.ajax({
    "url": book_collection_url,
    "dataType": "jsonp"
  }).done(function(data) {
    var read_list = [];
    var wish_list = [];
    data.collections.forEach(function(collection) {
      if (collection.status == "read") {
        read_list.push(collection);
      } else if (collection.status == "wish") {
        wish_list.push(collection);
      }
    });

    gen_book_list(d3.select("#read"), read_list);
    gen_book_list(d3.select("#wish"), wish_list);
    gen_book_detail(read_list[0]);
  });
}

function load_movie_list() {
  var douban_url = "http://api.douban.com";
  var movie_us_url = douban_url + "/v2/movie/us_box";
  var movie_detail_url = douban_url + "/v2/movie/subject/";
  var movie_cache = {};

  function display_movie(movie) {

    function person_name(person) {
      return person.name;
    }

    function populate_movie(movie) {
      movie_detail = d3.select("div#movies div#movie-detail");
      movie_detail.select(".media img").attr("src", movie.image);
      movie_detail.select(".media a").attr("href", movie.alt);

      cols = ["title", "director", "casts"];
      movie_detail.select("ul").selectAll("li")
        .data(cols).enter().append("li")
        .classed("list-group-item", true)
        .attr("id", function(d) { return d; });
      movie_detail.select("ul").selectAll("li")
        .data(d3.permute(movie, cols))
        .text(function(d, i) {
          col = cols[i];
          return col.toUpperCase()[0]+col.slice(1)+": "+d;
        });
      d3.select("div#movies div#movie-summary").text(movie.summary);
    }

    if (movie.id in movie_cache) {
      populate_movie(movie_cache[movie.id]);
    } else {
      $.ajax({
        "url": movie_detail_url+movie.id,
        "dataType": "jsonp"
      }).done(function(movie) {
        movie.title += " / " + movie.original_title;
        movie.image = movie.images.large;
        movie.rating = movie.rating.average;
        movie.director = movie.directors.map(person_name).join(", ");
        movie.casts = movie.casts.map(person_name).join(", ");

        populate_movie(movie);
        movie_cache[movie.id] = movie;
      });
    }
  }

  $.ajax({
    "url": movie_us_url,
    "dataType": "jsonp"
  }).done(function(data) {
    var movies = [];
    data.subjects.forEach(function(item) {
      var movie = item.subject;
      movie.rank = item.rank;
      movie.box = item.box;
      movie.title += " / " + movie.original_title;
      movie.rating = movie.rating.average;
      movies.push(movie);
    });

    var cols = ["rank", "title", "box", "rating"];
    var theader = {
      "rank": {"name": "Rank", "width": "10%"},
      "title": {"name": "Title", "width": "65%"},
      "box": {"name": "Box", "width": "15%"},
      "rating": {"name": "Rating", "width": "10%"}
    };

    d3.select("div#movies thead").selectAll("th")
      .data(d3.permute(theader, cols)).enter().append("th")
      .text(function(col) { return col.name; })
      .attr("width", function(col) { return col.width; });

    movie_row = d3.select("div#movies tbody").selectAll("tr")
      .data(movies).enter().append("tr")
      .style("cursor", "pointer")
      .on("click", function(movie) { display_movie(movie); });

    movie_row.selectAll("td")
      .data(function(movie) { return d3.permute(movie, cols); })
      .enter().append("td").text(function(d) { return d; })

    display_movie(movies[0]);
  });
}


function load_weibo() {
  var uid = "1717343864";
  var token = "2.00aanNsBXGJOADd5c82bd50902WeM1";
  var token_data = {"access_token": token, "uid": uid};
  var profile_url = "https://api.weibo.com/2/users/show.json";
  var weibo_timeline_url = "https://api.weibo.com/2/statuses/user_timeline.json";

  $.ajax({
    "url": profile_url,
    "data": token_data,
    "dataType": "jsonp"
  }).done(function(data) {
    profile = data.data;
    $("#weibo .panel-heading img").attr("src", profile.profile_image_url);
    $("#weibo .panel-heading a").attr("href", "http://www.weibo.com/"+profile.profile_url).html(profile.screen_name);
    $("#weibo .panel-heading #followings_count").html(profile.friends_count+" followings");
    $("#weibo .panel-heading #followers_count").html(profile.followers_count+" followers");
    $("#weibo .panel-heading #posts_count").html(profile.statuses_count+" posts");
  });

  /* post */
  $.ajax({
    "url": weibo_timeline_url,
    "data": token_data,
    "dataType": "jsonp"
  }).done(function(data) {
    // TODO: use d3 to rewrite this
    posts = data.data.statuses.slice(0, 3);

    var posts_panel = $("#weibo #posts");
    posts.forEach(function(post, i) {
      posts_panel.append("<li id='post-"+i+"' class='list-group-item'>" + post.text + "</li>");
      if (post.retweeted_status) {
        var retwt = post.retweeted_status;
        var post_item = posts_panel.find("li#post-"+i)
        post_item.append("<div class='panel'>" + retwt.text + "</div>");
        panel_body = post_item.find("div.panel");

        if (retwt.original_pic) {
          pic_link = "<a href='"+retwt.original_pic+"' target='_blank'>[ View Image ]</a>";
          panel_body.append("<span id='pic' class='label'>"+pic_link+"</span>");
        }

        // TODO: too urgly
        cm_cnt = "<span class='label label-success label-space'>comments <span class='badge'>"+retwt.comments_count+"</span></span>";
        rp_cnt = "<span class='label label-success label-space'>reposts <span class='badge'>"+retwt.reposts_count+"</span></span>";
        lk_cnt = "<span class='label label-success label-space'>likes <span class='badge'>"+retwt.attitudes_count+"</span></span>";
        panel_body.append("<br/><h5>"+cm_cnt+rp_cnt+lk_cnt+"</h5>");
      }
    });
  });
}

function load_renren() {
  var renren_token = "240086|6.6ec70dc2deb5058696be9ce7fd21a57f.2592000.1379379600-282173283";
  var uid = "282173283";
  var profile_url = "https://api.renren.com/v2/profile/get";

  // xhr = $.ajax({
  // 	"url": profile_url,
  // 	"data": {"access_token": renren_token, "userId": uid},
  // 	"dataType": "jsonp"
  // });

  var ajax = new Ajax();
  ajax.ondone = function(data) {
    alert(data);
  };
  ajax.get(profile_url, {"access_token": renren_token, "userId": uid});
}

function init_life() {
  $('#life-tabs a').click(function (e) {
    e.preventDefault();
    $(this).tab('show');
  })
}

function init_work() {
  $('#work-tabs a').click(function (e) {
    e.preventDefault();
    $(this).tab('show');
  })
}

function init() {
  $("div#work").children().css("display", "none");
  
  load_weibo();
  load_book_list();
  load_movie_list();
  init_life();
}

init();
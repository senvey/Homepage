
function load_weibo() {
  /* profile */
  $.get("proxy.php?content=weibo_profile").done(function(data) {
    var profile = data;
    $("#weibo .panel-heading img").attr("src", profile.profile_image_url);
    $("#weibo .panel-heading a").attr("href", "http://www.weibo.com/"+profile.profile_url).html(profile.screen_name);
    $("#weibo .panel-heading #followings_count").html(profile.friends_count+" 關注");
    $("#weibo .panel-heading #followers_count").html(profile.followers_count+" 粉絲");
    $("#weibo .panel-heading #posts_count").html(profile.statuses_count+" 微博");
  });

  /* posts */
  $.get("proxy.php?content=weibo_posts").done(function(data) {
    // TODO: use d3 to rewrite this
    var posts = data.statuses,
        total_length = 0,
        delimit = 5;

    for (var i in posts) {
      var post = posts[i];
      total_length += post.text.length;
      if (post.retweeted_status) {
        total_length += post.retweeted_status.text.length;
      }
      if (total_length > 500) {
        delimit = i;
        break;
      }
    }

    var posts_panel = $("#weibo #posts");
    posts.slice(0, delimit).forEach(function(post, i) {
      var pic_span = "";
      if (post.original_pic) {
        pic_link = "<a href='" + post.original_pic + "' target='_blank'>[ 查看圖片 ]</a>";
        pic_span = " <span class='text-primary'>" + pic_link + "</span>"
      }
      posts_panel.append("<li id='post-" + i + "' class='list-group-item'>" + post.text + pic_span + "</li>");
      total_length += post.text.length;

      if (post.retweeted_status) {
        var retwt = post.retweeted_status;
        var post_item = posts_panel.find("li#post-"+i)
        post_item.append("<div class='well'>" + retwt.text + "</div>");
        total_length += retwt.text.length;

        panel_body = post_item.find("div.well");
        if (retwt.original_pic) {
          pic_link = "<a href='" + retwt.original_pic + "' target='_blank'>[ 查看圖片 ]</a>";
          panel_body.append(" <span class='text-primary'>" + pic_link + "</span>");
        }

        // TODO: too urgly
        lk_cnt = "<span class='label label-success label-space'>贊 <span class='badge'>"+retwt.attitudes_count+"</span></span>";
        rp_cnt = "<span class='label label-success label-space'>轉發 <span class='badge'>"+retwt.reposts_count+"</span></span>";
        cm_cnt = "<span class='label label-success label-space'>評論 <span class='badge'>"+retwt.comments_count+"</span></span>";
        panel_body.append("<br/><h5>"+lk_cnt+" "+rp_cnt+" "+cm_cnt+"</h5>");
      }
    });
  });
}


function load_renren() {
  $.get("proxy.php?content=renren_profile").done(function(data) {
    var profile = data.response;

    $("#renren-friends").append(profile.friendCount);
    $("#renren-visitors").append(profile.visitorCount);
  });

  $.get("proxy.php?content=renren_feeds").done(function(data) {
    var feeds = data.response,
        feeds_panel = $("div#renren ul#feeds");

    feeds.slice(0, 5).forEach(function(feed) {
      var feed_content =  feed.resource.content;
      if (feed.resource.url) {
        feed_content += " " + feed.resource.url;
      }
      feed_content += " -- " + feed.time;

      feeds_panel.append("<li class='list-group-item'>" + feed_content + "</li>")
    });
  });

  $.get("proxy.php?content=renren_shares").done(function(data) {
    var shares = data.response,
        shares_panel = $("div#renren ul#shares");

    shares.slice(0, 3).forEach(function(share) {
      var share_content = "";
      if (share.thumbUrl) {
        var img = "<img class='media-object img-rounded' style='max-width: 150px;' src='" + share.thumbUrl + "'>";
        share_content += "<a class='pull-left' href='"+ share.url + "' target='_blank'>" + img + "</a>";
      }
      var title = "<a href='" + share.url + "' target='_blank'>" + share.title + "</a> -- " + share.shareTime;
      share_content += "<div class='media-body'>" + title + "<br/>" + share.summary + "</div>";

      shares_panel.append("<li class='list-group-item'><div class='media'>" + share_content + "</div></li>")
    });
  });
}


function load_book_list() {
  // TODO: add loading bar in the beginning and while retrieving book image
  var uid = "45816769";
  var book_collection_url = "https://api.douban.com/v2/book/user/"+uid+"/collections";
  var book_url = "http://book.douban.com/subject/";

  function gen_book_detail(collection) {
    $("div#book-detail .panel-heading").html(collection.book.title + "<br/>");

    if (collection.tags) {
      d3.select("div#book-detail .panel-heading").selectAll()
      .data(collection.tags)
      .enter().append("span")
      .classed("badge", true)
      .text(function(d) {return d;});
    }

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

  function load_list_by_status(status) {
    // as of 10/19/2013, the API returns at most 20 items at a time
    $.ajax({
      "url": book_collection_url + "?status=" + status,
      "dataType": "jsonp"
    }).done(function(data) {
      gen_book_list(d3.select("#" + status), data.collections);

      if (status == "read")
        gen_book_detail(data.collections[0]);
    });
  }

  load_list_by_status("read");
  load_list_by_status("wish");
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
      col_disp = ["影片名稱", "導演", "演員"];
      movie_detail.select("ul").selectAll("li")
        .data(cols).enter().append("li")
        .classed("list-group-item", true)
        .attr("id", function(d) { return d; });
      movie_detail.select("ul").selectAll("li")
        .data(d3.permute(movie, cols))
        .text(function(d, i) {
          col = cols[i];
          return col_disp[i] + ": " + d;
        });
      d3.select("div#movies div#movie-summary").text(movie.summary);
    }

    if (movie.id in movie_cache) {
      populate_movie(movie_cache[movie.id]);
    } else {
      $.get("proxy.php?content=douban_movie_detail&movie_id=" + movie.id).done(function(movie) {
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

  $.get("proxy.php?content=douban_us_box").done(function(data) {
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
      "rank": {"name": "排名", "width": "10%"},
      "title": {"name": "影片名稱", "width": "65%"},
      "box": {"name": "票房收入", "width": "15%"},
      "rating": {"name": "打分", "width": "10%"}
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

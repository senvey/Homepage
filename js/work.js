
function load_linkedin() {
  // // token with full_profile and network access
  // var token = "AQXJsMV254lDeXNlmbbitcLtN-JRZbKK2g0fUp4qzJd53F6TVw21mckRTdHM-bMZVH5Lrutr7nnDbA6zDji1lHl70FK-GbjZy52xmCpK8ZiTL_kiQ0kD7Qx2pY0GR7-HUJd7d1OQa_KoWDoFmx_0ayzCcxbZryZHZxUuVKqasVdXQoz0ugA";
  // var profile_url = "https://api.linkedin.com/v1/people/~";
  // var basic_profile_fields = ["picture-url", "formatted-name", "headline", "location", "industry", "positions", "num-connections", "summary", "specialties", "public-profile-url"];
  // var full_profile_fields = ["skills", "educations", "last-modified-timestamp", "recommendations-received"];
  // var profile_filter = ":("+basic_profile_fields+","+full_profile_fields+")";
  // var url = profile_url+profile_filter+"?format=json&oauth2_access_token="+token;
  //
  // $.ajax({
  //  url: "proxy.php?url="+encodeURIComponent(url),
  //  dataType: "json",
  // }).done(function(data) {
  //  console.log(data.formattedName);
  // })

  $.get("linkedin.json", function(data) {
    $("div#linked-in .media img").attr("src", data.pictureUrl);
    $("div#linked-in .media-body #full-name").text(data.formattedName);
    $("div#linked-in .media-body #headline").text(data.headline);
    $("div#linked-in .media-body .lead").text(data.location.name+" | "+data.industry);
    $("div#linked-in .media-body #location-industry").text(data.location.name+" | "+data.industry);

    var positions = [];
        educations = [];
    data.positions.values.forEach(function(pos) {
      positions.push(pos.title + " at " + pos.company.name);
    });
    data.educations.values.forEach(function(education) {
      educations.push(education.degree + " at " + education.schoolName);
    })
    $("div#linked-in dt#positions").after("<dd>"+positions.join("<br/>")+"</dd>");
    $("div#linked-in dt#education").after("<dd>"+educations.join("<br/>")+"</dd>");
    $("div#linked-in dt#recommendations").after("<dd>"+data.recommendationsReceived._total+" people have recommended for "+data.firstName+"</dd>");
    $("div#linked-in dt#connections").after("<dd>"+data.numConnections+" connections</dd>");
    $("div#linked-in dt#profile-link").after("<dd><a href='"+data.publicProfileUrl+"' target='_blank'>"+data.publicProfileUrl+"</dd>");

    var recommendations = [];
        skills = [];
    data.recommendationsReceived.values.forEach(function(rec) {
      recommendations.push("<blockquote><p>" + rec.recommendationText + "</p><small>" + rec.recommender.firstName + " " + rec.recommender.lastName + " (" + rec.recommendationType.code + ")</small></blockquote>");
    });
    data.skills.values.forEach(function(skill) {
      skills.push(skill.skill.name);
    });
    $("div#linked-in .panel-group div#p-summary p").after("<p>"+data.summary+"</p><p>"+data.specialties.replace("\n", "<br/>")+"</p>");
    $("div#linked-in .panel-group div#p-skills p").after("<p>"+skills.join(", ")+"</p>");
    $("div#linked-in .panel-group div#p-recommendations p").after(recommendations.join("<br/>"));
  })
}


//TODO: use d3 data binding and represent using more fancy style
//TODO: actually try to add callback function
function load_github() {
  var user_url = "https://api.github.com/users/senvey",
      token = "";
  
  $.ajax({
    url: user_url + token,
    dataType: "jsonp"
  }).done(function(resp) {
    var user = resp.data;
    $("#github a#html_url").attr("href", user.html_url).text(user.html_url);
    $("#github #name").text(user.name);
    $("#github #id").text(user.login);
    $("#github #location-dd").text(user.location);
    date_created = new Date(user.created_at);
    $("#github #time-joined-dd span").after(date_created.toLocaleDateString());
    
    populate_followers(user.followers_url + token);
    populate_following(user.following_url.split('{')[0] + token);
    populate_starred(user.starred_url.split('{')[0] + token);
    populate_watched(user.subscriptions_url + token);
    
    populate_repos(user.repos_url + token);
  });

  function populate_repos(api_url) {
    $.ajax({
      url: api_url,
      dataType: "jsonp"
    }).done(function(resp) {
      var repos = resp.data;
      repos.forEach(function(repo) {
        //TODO(minor): peel off the style control
        var repo_info = d3.select("div#github div#repos ul")
          .append("li").classed("list-group-item", true).append("h4").style("margin", "0");
        repo_info.append("a")
          .attr("href", repo.html_url).attr("target", "_blank").text(repo.name);
        repo_info.append("span")
          .classed("badge pull-right", true).text(repo.watchers_count);
        repo_info.append("br");
        if (repo.description.length > 0) {
          if (repo.description.length > 40) {
            repo_desc = repo.description.substr(0, 40) + "...";
          } else {
            repo_desc = repo.description;
          }
          repo_info.append("small").text(repo_desc);
          repo_info.append("br");
        }

        var labels = repo_info.append("small");
        labels.append("span").classed("label label-primary", true)
          .text(function() {
            if (repo.fork) return "forked"; else return "original";
          });
        labels.append("span").html("&nbsp");
        labels.append("span").classed("label label-primary", true)
          .text("created: " + new Date(repo.created_at).toLocaleDateString());
        labels.append("span").html("&nbsp");
        labels.append("span").classed("label label-primary", true)
          .text("updated: " + new Date(repo.updated_at).toLocaleDateString());
        labels.append("span").html("&nbsp");
        labels.append("span").classed("label label-primary", true)
          .text(repo.language);
      });
    });
  }


  function populate_followers(api_url) {
    $.ajax({
      url: api_url,
      dataType: "jsonp"
    }).done(function(resp) {
      var followers = resp.data;
      $("#github #g-followers h3").text(followers.length);
    });
  }

  function populate_following(api_url) {
    $.ajax({
      url: api_url,
      dataType: "jsonp"
    }).done(function(resp) {
      var following = resp.data;
      $("#github #g-following h3").text(following.length);
    });
  }

  function populate_starred(api_url) {
    $.ajax({
      url: api_url,
      dataType: "jsonp"
    }).done(function(resp) {
      var starred = resp.data;
      $("#github #g-starred h3").text(starred.length);
    });
  }

  function populate_watched(api_url) {
    $.ajax({
      url: api_url,
      dataType: "jsonp"
    }).done(function(resp) {
      var watched = resp.data;
      $("#github #g-watched h3").text(watched.length);
    });
  }
  
}

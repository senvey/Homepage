
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

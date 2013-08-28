

function init_work() {
  $('#work-tabs a').click(function (e) {
    e.preventDefault();
    $(this).tab('show');
  })
}


function load_linkedin() {
	// token with full_profile and network access
	var token = "AQXJsMV254lDeXNlmbbitcLtN-JRZbKK2g0fUp4qzJd53F6TVw21mckRTdHM-bMZVH5Lrutr7nnDbA6zDji1lHl70FK-GbjZy52xmCpK8ZiTL_kiQ0kD7Qx2pY0GR7-HUJd7d1OQa_KoWDoFmx_0ayzCcxbZryZHZxUuVKqasVdXQoz0ugA";
	var profile_url = "https://api.linkedin.com/v1/people/~";
	var basic_profile_fields = ["picture-url", "formatted-name", "headline", "location", "industry", "positions", "num-connections", "summary", "specialties", "public-profile-url"];
	var full_profile_fields = ["skills", "educations", "last-modified-timestamp", "recommendations-received"];
	var profile_filter = ":("+basic_profile_fields+","+full_profile_fields+")";
	var url = profile_url+profile_filter+"?format=json&oauth2_access_token="+token;
	
	$.ajax({
		url: "proxy.php?url="+encodeURIComponent(url),
		dataType: "json",
	}).done(function(data) {
		console.log(data.formattedName);
	})
}
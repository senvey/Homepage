<?php
// File Name: proxy.php
if (!isset($_GET['url']) && !isset($_GET['content'])) die();

header('Content-Type: application/json');

if (isset($_GET['url'])) {
  $url = urldecode($_GET['url']);

  if (isset($_GET['content'])) {
    $github_token = 'e2bb7bfad4ae5ca2e9b0e6bb53c3d3844004bd44';
    if (urlencode($_GET['content']) == 'github') {
      $url .= '?access_token='. $github_token;
    }
  }
  echo file_get_contents($url);
  die();
}

$weibo_uid = '1717343864';
$weibo_token = '2.00aanNsBXGJOADd5c82bd50902WeM1';
$weibo_profile_url = 'https://api.weibo.com/2/users/show.json?uid=%s&access_token=%s';
$weibo_posts_url = 'https://api.weibo.com/2/statuses/user_timeline.json?uid=%s&access_token=%s';

$renren_uid = '282173283';
$renren_token = '240086|6.6ec70dc2deb5058696be9ce7fd21a57f.2592000.1379379600-282173283';
$renren_profile_url = 'https://api.renren.com/v2/profile/get?userId=%s&access_token=%s';
$renren_share_url = 'https://api.renren.com/v2/share/list?ownerId=%s&access_token=%s';

// token with full_profile and network access
$linkedin_token = 'AQXJsMV254lDeXNlmbbitcLtN-JRZbKK2g0fUp4qzJd53F6TVw21mckRTdHM-bMZVH5Lrutr7nnDbA6zDji1lHl70FK-GbjZy52xmCpK8ZiTL_kiQ0kD7Qx2pY0GR7-HUJd7d1OQa_KoWDoFmx_0ayzCcxbZryZHZxUuVKqasVdXQoz0ugA';
$linkedin_profile_url = 'https://api.linkedin.com/v1/people/~';
$linkedin_basic_profile_fields = array("picture-url", "formatted-name", "headline", "location", "industry", "positions", "num-connections", "summary", "specialties", "public-profile-url");
$linkedin_full_profile_fields = array("skills", "educations", "last-modified-timestamp", "recommendations-received");
$linkedin_profile_filter = ":(". join(",", $linkedin_basic_profile_fields) .",". join(",", $linkedin_full_profile_fields) .")";
$linkedin_profile_url .= $linkedin_profile_filter ."?format=json&oauth2_access_token=%s";

$content = urldecode($_GET['content']);
switch ($content) {
  case 'weibo_profile':
    echo file_get_contents(sprintf($weibo_profile_url, $weibo_uid, $weibo_token));
    break;
  case 'weibo_posts':
    echo file_get_contents(sprintf($weibo_posts_url, $weibo_uid, $weibo_token));
    break;
  case 'renren_profile':
    echo file_get_contents(sprintf($renren_profile_url, $renren_uid, $renren_token));
    break;
  case 'renren_share':
    echo file_get_contents(sprintf($renren_share_url, $renren_uid, $renren_token));
    break;
  case 'linkedin_profile':
    echo file_get_contents(sprintf($linkedin_profile_url, $linkedin_token));
    break;
}
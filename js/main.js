
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

function init() {
  $("div#work").children().css("display", "none");

  load_weibo();
  load_renren();
  load_book_list();
  load_movie_list();

  load_linkedin();
  load_github();
}

init();
(function(){
function convertClues(cluesEl) {
  var result = [];
  for (var el of cluesEl.children) {
    if (el.tagName !== 'clue') continue;
    var clueText = el.textContent;
    var clueNum = parseInt(el.getAttribute('number'));
    result[clueNum] = clueText;
  }
  return result;
}

function parseXML(doc, date) {
  var parser = new DOMParser();
  var xmlDoc = parser.parseFromString(doc ,"text/xml");
  function get(tag) {
    return xmlDoc.querySelector(tag).textContent;
  }
  var title = get('title'); // starts with 'LA Times'
  var author = get('creator');
  var copyright = get('copyright');
  var description = get('description');

  var grid = [];
  xmlDoc.querySelectorAll('cell').forEach(function(cell) {
    var answer = cell.getAttribute('solution') || '.';
    var i = parseInt(cell.getAttribute('y')) - 1;
    var j = parseInt(cell.getAttribute('x')) - 1;
    if (!grid[i]) grid[i] = [];
    grid[i][j] = answer;
  });

  var filename = 'lat' + date.str + date.dayOfWeekStr + '.puz';

  var meta = {
    description: description,
    title: title,
    notes: '',
    author: author,
    copyright: copyright,
  };

  var clueEls = xmlDoc.querySelectorAll('clues');
  var acrossEl = clueEls[0];
  var downEl = clueEls[1];
  var clues = {
    across: convertClues(acrossEl),
    down: convertClues(downEl),
  };

  return {
    meta: meta,
    grid: grid,
    clues: clues,
    circles: [],
    filename: filename,
  }
}

function loadLA(url, date, callback) {
  fetch(url,
    function success(response) {
      var puzzle = parseXML(response, date);
      if (!puzzle) {
        callback();
      } else {
        var ratingUrl = `http://crosswordfiend.com/ratings_count_json.php?puzz=${date.strHyphens}-la`;
        getCFRating(ratingUrl, function(rating) {
          puzzle.rating = rating;
          callback(puzzle);
        });
      }
    },
  );
}

window.LATimesLoader = {
  load: function(date, callback) {
    var url = `http://cdn.games.arkadiumhosted.com/latimes/assets/DailyCrossword/la${date.str}.xml`;
    loadLA(url, date, callback);
  },
};
}());

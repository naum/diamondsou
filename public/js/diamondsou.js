
$.capitalize = function(str) {
  return str.replace(/^[a-z]/, function(c) { return c.toUpperCase(); } );
}

$.keys = function(o) {
  var lok = [];
  $.each(o, function(k, v) {
    lok.push(k);
  });
  return lok;
};

$.shuffle = function(l) {
  var i = l.length;
  if (i == 0) { return false; }
  while (--i) {
    var j = Math.floor(Math.random() * (i + 1));
    var t = l[i];
    l[i] = l[j];
    l[j] = t;
  }
};

$.storehouse = {};

$.storehouse.get = function(k) {
  var datastore = (window.localStorage) ? window.localStorage : global.Storage[location.hostname];
  var sob = datastore[k];
  return (sob.value) ? sob.value : sob;
};

$.storehouse.update = function(k, o) {
  var datastore = (window.localStorage) ? window.localStorage : global.Storage[location.hostname];
  datastore[k] = o;
};

var ERRORMESSAGE = null;

$(document).ready(function() {
  setupAjaxProtocol();
  setupLinkButtonBehavior();
  loadUBAData();
});

var dispatch = function(act, b) {
  if (act == '/new') {
    UBA.genesis(8);
    displayRosters();
    $.storehouse.update('leaguekey', JSON.stringify(UBA.data));
  } else if (act == '/freeagents') {
    displayFreeAgents();
  } else if (UBA.data.teams.length > 0) {
    if (act == '/rosters') {
      displayRosters();
    } else if (act == '/standings') {
      displayStandings();
    }
  } else {
    displayError((ERRORMESSAGE) ? ERRORMESSAGE : 'problem parsing league data');
  }
};

var displayError = function(err) {
  $('#pagecontent')
    .html('<div class="errorbox">' + err + '</div>');
};

var displayHighlight = function(hmes) {
  $('#pagecontent')
    .html('<div class="highlight">' + hmes + '</div>');
};

var displayFreeAgents = function() {
  var trow = [];
  UBA.data.freeagents.sort(function(a, b) {
    return MAN.worth(b) - MAN.worth(a);
  });
  $.map(UBA.data.freeagents, function(fa) {
    trow.push('<tr>' 
      + '<td>' + fa.pos
      + '<td class="celtex">' + fa.name  
      + '<td class="celtex">' + MAN.displaySkillCard(fa)
    );
  });
  var fatab = '<table>'
    + '<th>POS<th class="celtex">NAME<th class="celtex">SKILL'
    + trow.join('') 
    + '</table>';
  generatePageContent('free agents', fatab);
};

var displayRosters = function() {
  var trhead = '<tr><th>POS<th>{TEAMNAME}<th>SKILL';
  var trow = [];
  $.each(UBA.data.teams, function(i, t) {
    trow.push(trhead.replace(/{TEAMNAME}/, t.city.toUpperCase()));    
    $.each(t.roster, function(x, m) {
      trow.push(
        '<tr>'
        + '<td class="celtex">' + m.pos  
        + '<td class="celtex">' + m.name  
        + '<td class="celtex">' + MAN.displaySkillCard(m)
      );
    });
    trow.push('<tr style="border:none;"><td colspan="3">&nbsp;</td>');
  });
  var rostab = '<table>' + trow.join('') + '</table>';
  generatePageContent('rosters', rostab);
};

var displayStandings = function() {
  var trow = [ '<tr class="ui-widget-header"><th class="celtex">TEAM<th>W<th>L<th>RF<th>RA<th>W%' ];
  $.each(UBA.data.standings, function(c, t) {
    trow.push(
      '<tr>'
      + '<td class="celtex">' + c
      + '<td>' + t.w
      + '<td>' + t.l
      + '<td>' + t.rf
      + '<td>' + t.ra
      + '<td>' + TEAM.winPercentage(t).toFixed(3)
    );
  });
  var standtab = '<table>' + trow.join('') + '</table>';
  generatePageContent('standings', standtab);
};

var loadUBAData = function() {
  var leag = null;
  try {
    leag = $.storehouse.get('leaguekey');
    UBA.data = JSON.parse(leag);
  } catch(e) {
    ERRORMESSAGE = 'no league record in the storehouse';
  }
};

var log = function(m) {
  $('#console').append(m + "<br>\n");
};

var generatePageContent = function(h, c) {
  $('#pagecontent').html('<div class="ui-widget">'
    + '<div class="ui-widget-header ui-corner-top"><h2>' + h + '</h2></div>'
    + '<div class="ui-widget-content ui-corner-bottom">' + c + '</div>'
    + '</div>');
};

var populateNamepool = function(data, textstatus) {
  var wordlist = data.split('\n');
  $.shuffle(wordlist);
  var totnames = 13 * 24;
};

var setupAjaxProtocol = function () {
  $('#pageloadindicator')
    .bind('ajaxStart', function() { $(this).show(); })
    .bind('ajaxComplete', function() { $(this).hide(); });
  $.ajaxSetup({
    error: function(rt, ts, xhr) {
      displayError(ts);
    },
    timeout: 24000
  });
};

var setupLinkButtonBehavior = function() {
  $('.linkbutton').click(function(e) {
    e.preventDefault();
    $('#console').empty();
    $('#pagecontent').empty();
    var act = $(this).attr('href');
    log("act => " + act);
    var $b = $(this);
    dispatch(act, $b);
  });
};



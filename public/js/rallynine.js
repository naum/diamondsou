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


var dispatch = function(route, $b) {
  if (route == '/create') {
    UBA.genesis(32);
    displayRosters();
    $.storehouse.update('leaguekey', JSON.stringify(UBA.data));
    toggleButtonActive($b);
  } else if (route == '/freeagents') {
    var namelist = [];
    var totNames = 13 * 24;
    for (var i = 0; i < totNames; i++) {
      namelist.push(NAMEPOOL.draw());
    }
    var namelist = '<ol><li>' + namelist.join('</li><li>') + '</li><ol>';
    generatePageContent('freeagents', namelist);
    toggleButtonActive($b);
  } else if (route == '/guide') {
      generatePageContent('guide', '<div style="ui-state-highlight ui-corner-all"><p>manual goes in here&hellip;</div>');
      toggleButtonActive($b);
  } else if (UBA.data.teams.length > 0) {
    if (route == '/rosters') {
      displayRosters();
      toggleButtonActive($b);
    } else if (route == '/standings') {
      displayStandings();
      toggleButtonActive($b);
    } else {
      //$('#pagecontent').load(route, null, function(rt, ts, hr) {
      //  toggleButtonActive($b);
      //});
      displayHighlight('construction time again&hellip;');
      toggleButtonActive($b);
    }
  } else {
    displayError((ERRORMESSAGE) ? ERRORMESSAGE : 'problem parsing league data');
    toggleButtonActive($b);
  }
};

var displayError = function(err) {
  $('#pagecontent')
    .html('<div class="alertbox ui-state-error ui-corner-all">error: ' + err + '</div>');
};

var displayHighlight = function(hmes) {
  $('#pagecontent')
    .html('<div class="alertbox ui-state-highlight ui-corner-all">' + hmes + '</div>');
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
      + '<td>' + fa.skill['W']
      + '<td>' + fa.skill['K']
      + '<td>' + fa.skill['P']
      + '<td>' + fa.skill['R']
      + '<td>' + fa.skill['F']
      + '<td>' + fa.skill['T']
    );
  });
  var fatab = '<table class="ui-widget ui-corner-all"><tr class="ui-widget-header ui-corner-top">' 
    + '<th>POS<th class="celtex">NAME<th>W<th>K<th>P<th>R<th>F<th>T'
    + trow.join('') 
    + '</table>';
  generatePageContent('genesis', fatab);
};

var displayRosters = function() {
  var trhead = '<tr class="ui-widget-header"><th>POS<th class="celtex">{TEAMNAME}<th>W<th>K<th>P<th>R<th>F<th>T';
  var trow = [];
  $.each(UBA.data.teams, function(i, t) {
    trow.push(trhead.replace(/{TEAMNAME}/, t.city.toUpperCase()));    
    $.each(t.roster, function(x, m) {
      trow.push(
        '<tr>'
        + '<td>' + m.pos
        + '<td class="celtex">' + m.name  
        + '<td>' + m.skill['W']
        + '<td>' + m.skill['K']
        + '<td>' + m.skill['P']
        + '<td>' + m.skill['R']
        + '<td>' + m.skill['F']
        + '<td>' + m.skill['T']
      );
    });
    trow.push('<tr style="border:none;"><td colspan="8">&nbsp;</td>');
  });
  var rostab = '<table class="ui-widget ui-corner-all">' + trow.join('') + '</table>';
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
  var standtab = '<table class="ui-widget ui-corner-all">' + trow.join('') + '</table>';
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
  $('button[id^="go_"]')
    .hover(
      function() { $(this).removeClass('ui-state-default').addClass('ui-state-hover'); },
      function() { $(this).removeClass('ui-state-hover').addClass('ui-state-default'); }
    )
  $('button[id^="go_"]').click(function() {
    $(this).removeClass('ui-state-default ui-state-hover').addClass('ui-state-disabled');
    $(this).attr('disabled', true);
    $('#pagecontent').empty();
    var route = '/' + $(this).text();
    var $b = $(this);
    dispatch(route, $b);
  });
};

var toggleButtonActive = function($b) {
  $b.removeAttr('disabled');
  $b.removeClass('ui-state-disabled ui-state-hover').addClass('ui-state-default');
}


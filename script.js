// Ending strings to remove
var excluded = [
  'Leggi e commenta il post  su www.beppegrillo.it',
  '>>> Il Blog delle Stelle ora è anche su Telegram con tutte le news e i commenti.\nRimani aggiornato ---> Clicca qui https://telegram.me/blogdellestelle e UNISCITI. <<<',
], viewed = [];

// Parse url
var repository = window.location.host,
    owner = repository.split('.')[0];

document.querySelector('footer a').href = 'https://github.com/' + owner + '/' + repository;
document.querySelector('footer a').title = repository;

// Initialize viewed array in localStorage
  if (!localStorage.viewedFinal) {
    localStorage.viewedFinal = JSON.stringify(viewed);
} else {
  viewed = JSON.parse(localStorage.viewedFinal);
}

// Append script, parse rss as jsonp
var script = document.createElement('script');
// script.src = '//ajax.googleapis.com/ajax/services/feed/load?callback=renderArticles&v=1.0&num=10&q=' + encodeURIComponent('http://feeds.feedburner.com/beppegrillo/rss');
script.src = '//api.rss2json.com/v1/api.json?callback=renderArticles&timer=' + new Date().getTime() + '&rss_url=' + encodeURIComponent('http://feeds.feedburner.com/beppegrillo/rss');
document.getElementsByTagName('head')[0].appendChild(script);

// Get first image src
function getFoto(html){
  var arr = [],
  resrc = /src="(.*?)"/g,
  refb = /<a href="https:\/\/www.facebook.com\/movimentocinquestelle\/videos\/.+?\/(.*?)\//g,
  item;

  while( item = resrc.exec(html) )
    if( item[1].indexOf("embed") === -1 && item[1]) return item[1];
  //
  // while (item = refb.exec(html)) {
  //   if (item[1]) return 'https://graph.facebook.com/' + item[1] + '/picture';
  // }
  return false;
}

// Get first image src
function getYoutube(html){
  var arr = [],
  resrc = /src="(.*?)"/g,
  item;

  while( item = resrc.exec(html) )
    if(item[1]) return item[1];
  //
  // while (item = refb.exec(html)) {
  //   if (item[1]) return 'https://graph.facebook.com/' + item[1] + '/picture';
  // }
  return false;
}

// Strip html tags (http://stackoverflow.com/a/822486)
function strip(html){
  var tmp = document.createElement("div");
  tmp.innerHTML = html;
  var fuori = tmp.textContent || tmp.innerText || "";
  for (var i = 0; i < excluded.length; i++) {
    var size = excluded[i].length;
    if (fuori.substr(fuori.length - size) == excluded[i]) fuori = fuori.slice(0,-size);
  }
  var breakLine = fuori.trim().replace(/\n{2,}/g, '<br><br>');
  var pulito = fuori.trim();
  return [breakLine, pulito];
}

function renderArticles(result) {
  // Get entries array
  // var en = result.responseData.feed.entries;
  var en = result.items;
  // Create article from template
  var article = document.querySelector('#article').content;
  // Loop entries
  for (var i = 0; i < en.length; i++) {
    var entry = document.importNode(article, true);
    // Set date
    var date = new Date(en[i].pubDate).toLocaleDateString("it-IT", {
			weekday: "long",
			day: "numeric",
			month: "long",
			year: "numeric",
			hour: "numeric",
			minute: "numeric"
		}).toUpperCase();
    entry.querySelector('small').innerHTML = date;
    // Check image
    var foto = getFoto(en[i].content);
    if (foto) {
      // Add image
      var immagine = document.createElement('img');
      var header = entry.querySelector('header');
      immagine.src = foto;
      header.parentNode.insertBefore(immagine, header.nextSibling);
    } else {
      var ytid = getYoutube(en[i].content);
      if (ytid) {
        var id = ytid.substr(ytid.lastIndexOf('/') + 1);
        foto = 'http://img.youtube.com/vi/' + id + '/0.jpg';
        var immagine = document.createElement('img');
        var header = entry.querySelector('header');
        immagine.src = foto;
        header.parentNode.insertBefore(immagine, header.nextSibling);

      }
    }
    // Set title
    entry.querySelector('h2 a').innerHTML = en[i].title;
    // Set link: True link using last url fragment
    var link = 'http://www.ilblogdellestelle.it/' + en[i].link.substr(en[i].link.lastIndexOf('/') + 1);
    entry.querySelector('h2 a').href = link;
    // Check if article is viewed
    if (viewed.indexOf(link) === -1) {
      // Not viewed
      // viewed = viewed.slice(0, 10); // end is not included
      // Add new element
      viewed[viewed.length] = link;
      // limit array, strip firsts
      if(viewed.length>10){
        viewed = viewed.slice((viewed.length-10), viewed.length);
      }
      // Apply new class
      entry.querySelector('small').className += ' new';
    }
    // Set content
    entry.querySelector('div').innerHTML = strip(en[i].content)[0];
    // Set categories
    entry.querySelector('header small').innerHTML = toTitleCase(en[i].categories.join(', '));
    var categories = en[i].categories.map(mapCallback).join('&labels[]=');
	var tagString = en[i].categories.map(toTitleCase).join('\n- ');
    // Add write link
    var img = foto ? '![](' + foto + ')\n\n' : '';
    var writeLink = document.createElement('a');
	writeLink.classList.add('save-link');
    writeLink.href = 'https://github.com/' + owner + '/' + repository + '/issues/new?title=' +
      encodeURIComponent(en[i].title) + '&labels[]=' + categories + '&body=' +
      encodeURIComponent('## [' + en[i].title + '](' + link + ')\n\n**' + date + '**\n\n' + img + '- ' + tagString);
	// removed content: + encodeURIComponent(strip(en[i].content)[1])
    writeLink.innerHTML = 'save';
    entry.querySelector('small').appendChild(writeLink);
    // Append element
    document.querySelector("section").appendChild(entry);
  }
  endLoop();
}

function mapCallback(string) {
  var out = encodeURIComponent(toTitleCase(string));
  return out;
}

function endLoop() {
  localStorage.viewedFinal = JSON.stringify(viewed);
  document.body.setAttribute('data-viewed', viewed.length);
  document.body.setAttribute('data-first', viewed[0]);
  document.body.setAttribute('data-last', viewed[viewed.length - 1]);
}

function toTitleCase(str) {
  return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}

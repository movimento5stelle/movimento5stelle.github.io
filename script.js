// Ending strings to remove
var excluded = [
  'Leggi e commenta il post  su www.beppegrillo.it',
  '>>> Il Blog delle Stelle ora è anche su Telegram con tutte le news e i commenti.\nRimani aggiornato ---> Clicca qui https://telegram.me/blogdellestelle e UNISCITI. <<<',
], viewed = [];

// Initialize viewed array in localStorage
if (!localStorage.viewed) {
  localStorage.viewed = JSON.stringify(viewed);
} else {
  viewed = JSON.parse(localStorage.viewed);
}

// Append script, parse rss as jsonp
var script = document.createElement('script');
script.src = '//ajax.googleapis.com/ajax/services/feed/load?callback=renderArticles&v=1.0&num=10&q=' + encodeURIComponent('http://feeds.feedburner.com/beppegrillo/rss');
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

// Strip html tags (http://stackoverflow.com/a/822486)
function strip(html){
  var tmp = document.createElement("div");
  tmp.innerHTML = html;
  var fuori = tmp.textContent || tmp.innerText || "";
  for (var i = 0; i < excluded.length; i++) {
    var size = excluded[i].length;
    if (fuori.substr(fuori.length - size) == excluded[i]) fuori = fuori.slice(0,-size);
  }
  fuori = fuori.trim().replace(/\n{2,}/g, '<br><br>');
  return fuori;
}

function renderArticles(result) {
  // Get entries array
  var en = result.responseData.feed.entries;
  // Create article from template
  var article = document.querySelector('#article').content;
  // Loop entries
  for (var i = 0; i < en.length; i++) {
    var entry = document.importNode(article, true);
    entry.querySelector('small').innerHTML = new Date(en[i].publishedDate).toLocaleDateString("it-IT", {
			weekday: "long",
			day: "numeric",
			month: "long",
			year: "numeric",
			hour: "numeric",
			minute: "numeric"
		});
    var foto = getFoto(en[i].content);
    if (foto) {
      var immagine = document.createElement('img');
      var header = entry.querySelector('header');
      immagine.src = foto;
      header.parentNode.insertBefore(immagine, header.nextSibling);
    }
    entry.querySelector('h2 a').innerHTML = en[i].title;
    // True link using last url fragment
    var link = 'http://www.ilblogdellestelle.it/' + en[i].link.substr(en[i].link.lastIndexOf('/') + 1);
    entry.querySelector('h2 a').href = link;
    // Check if article is viewed
    if (viewed.indexOf(link) === -1) {
      viewed.push(link);
      // Limit array length
      viewed.splice(15);
      localStorage.viewed = JSON.stringify(viewed);
      entry.querySelector('small').className += ' new';
    }
    entry.querySelector('div').innerHTML = strip(en[i].content);
    entry.querySelector('header small').innerHTML = en[i].categories.join(', ');
    document.querySelector("section").appendChild(entry);
  }
}

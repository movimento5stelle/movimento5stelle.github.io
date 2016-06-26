var excluded = [
  'Leggi e commenta il post  su www.beppegrillo.it',
  '>>> Il Blog delle Stelle ora è anche su Telegram con tutte le news e i commenti.\nRimani aggiornato ---> Clicca qui https://telegram.me/blogdellestelle e UNISCITI. <<<',
], viewed = [];

if (!localStorage.viewed) {
  localStorage.viewed = JSON.stringify(viewed);
} else {
  viewed = JSON.parse(localStorage.viewed);
}

$.ajax({
  type:"GET",
  dataType:"jsonp",
  url:"//ajax.googleapis.com/ajax/services/feed/load",
  data:{"v":"1.0", "num":"10", "q":"http://feeds.feedburner.com/beppegrillo/rss"},
  success: renderArticles
});

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

function strip(html){
  // strip html tags from http://stackoverflow.com/a/822486
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

function fragment(url){
  var el = document.createElement('a');
  el.href = url;
  var arr = el.pathname.split('/');
  return 'http://www.ilblogdellestelle.it/' + arr.pop();
}

function renderArticles(result) {
  var en = result.responseData.feed.entries;
  for (var i = 0; i < en.length; i++) {
    var article = document.querySelector('#article').content;
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
    // entry.querySelector('img').src = getFoto(en[i].content);
    entry.querySelector('h2 a').innerHTML = en[i].title;
    var link = fragment(en[i].link);
    entry.querySelector('h2 a').href = link;
    if ($.inArray(link, viewed) < 0) {
      viewed.push(link);
      viewed.splice(15);
      localStorage.viewed = JSON.stringify(viewed);
      entry.querySelector('small').className += ' new';
    }
    entry.querySelector('div').innerHTML = strip(en[i].content);
    entry.querySelector('header small').innerHTML = en[i].categories.join(', ');
    document.querySelector("section").appendChild(document.importNode(entry, true));
  }
}

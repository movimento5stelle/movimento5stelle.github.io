var excluded = [
  'Leggi e commenta il post  su www.beppegrillo.it',
  '>>> Il Blog delle Stelle ora è anche su Telegram con tutte le news e i commenti.\nRimani aggiornato ---> Clicca qui https://telegram.me/blogdellestelle e UNISCITI. <<<',
],
divElement;

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
  return '';
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

function renderArticles(result) {
  var en = result.responseData.feed.entries;
  for (var i = 0; i < en.length; i++) {
    var entry = document.querySelector('#article').content;
    entry.querySelector('img').src = getFoto(en[i].content);
    entry.querySelector('h2 a').innerHTML = en[i].title;
    entry.querySelector('h2 a').href = en[i].link;
    entry.querySelector('div').innerHTML = strip(en[i].content);
    entry.querySelector('header small').innerHTML = new Date(en[i].publishedDate).toLocaleDateString("it-IT", {
			weekday: "long",
			day: "numeric",
			month: "long",
			year: "numeric",
			hour: "numeric",
			minute: "numeric"
		}) + '<br>' + en[i].categories.join(', ');
    document.querySelector("section").appendChild(document.importNode(entry, true));
  }
}

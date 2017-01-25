$(document).ready(function() {
	var viewed = [];
	// Parse url
	var repository = window.location.host,
	    owner = repository.split('.')[0];

	document.querySelector('footer a').href = 'https://github.com/' + owner + '/' + repository;
	document.querySelector('footer a').title = repository;

	// Initialize viewed array in localStorage
	if (!localStorage.getItem('viewedFinal')) {
		localStorage.setItem('viewedFinal', JSON.stringify(viewed));
	} else {
		viewed = JSON.parse(localStorage.getItem('viewedFinal'));
	}

	//feed to parse
	var feed = "https://cors-anywhere.herokuapp.com/http://www.beppegrillo.it/index.xml";

	$.ajax({
		url: feed,
		accepts:{
			xml:"application/rss+xml"
		},
		dataType:"xml",
		success: render
  });

	function render(data) {
		//Credit: http://stackoverflow.com/questions/10943544/how-to-parse-an-rss-feed-using-javascript
		$(data).find("item").each(function () { // or "item" or whatever suits your feed
				var el = $(this), cat = [];
				var entry = document.importNode(document.querySelector('#article').content, true);
				var link = el.find("link").text();
				// Title with link
				entry.querySelector('h2 a').innerHTML = el.find("title").text();
				entry.querySelector('h2 a').href = link;
				// Set content
				var content = el.find("description").text().replace(/<p><br \/><b><a href=\"(.*?)\">Leggi e commenta il post <\/a> su www.beppegrillo.it<\/b><\/p>/g,'');
				entry.querySelector('div').innerHTML = content;
				// Set date
				var date = new Date(el.find("pubDate").text()).toLocaleDateString("it-IT", {
					weekday: "long",
					day: "numeric",
					month: "long",
					year: "numeric",
					hour: "numeric",
					minute: "numeric"
				}).toUpperCase();
				entry.querySelector('small').innerHTML = date;
				// Set categories
				el.find("category").map( function (i,c) {
					entry.querySelector('header small').innerHTML += ((i !== 0) ? ', ' : '') + c.innerHTML;
				});
				// Check if article is viewed
				if (viewed.indexOf(el.find("link").text()) === -1) {
					// Not viewed
					// viewed = viewed.slice(0, 10); // end is not included
					// Add new element
					viewed[viewed.length] = el.find("link").text();
					// limit array, strip firsts
					if(viewed.length>15){
						viewed = viewed.slice((viewed.length-15), viewed.length);
					}
					// Apply new class
					entry.querySelector('small').className += ' new';
				}
				// Add to DOM
				document.querySelector("section").appendChild(entry);
		}).promise().done( function(){
			// store viewed
			localStorage.setItem('viewedFinal', JSON.stringify(viewed));
		} );
	}
});

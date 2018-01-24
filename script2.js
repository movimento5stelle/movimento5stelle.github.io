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
	var xml_url = "http://www.ilblogdellestelle.it/index.xml";
	// var xml_url = "http://www.beppegrillo.it/index.xml"
	var feed = "https://cors-anywhere.herokuapp.com/" + xml_url;

	$.ajax({
		url: feed,
		accepts:{
			xml:"application/rss+xml"
		},
		crossDomain: true,
		dataType:"xml",
		success: render,
		error: logError,
		beforeSend: setHeader
  });

	function setHeader(xhr) {
	  xhr.setRequestHeader('Access-Control-Allow-Origin', '*');
	}

	function logError(data) {
		console.log('error','render');
		$('body').css('background', 'orange');
		render(data.responseText);
	}

	function render(data) {
		// console.log('data',$(data).find("item"));
		//Credit: http://stackoverflow.com/questions/10943544/how-to-parse-an-rss-feed-using-javascript
		$(data).find("item").each(function () { // or "item" or whatever suits your feed
			var el = $(this), cat = [];
			var entry = document.importNode(document.querySelector('#article').content, true);
			var link = el.find("link").text();
			// Title with link
			entry.querySelector('h2 a').innerHTML = el.find("title").text();
			entry.querySelector('h2 a').href = link;
			// Set content
			// var content = el.find("description").text().replace(/<p><br \/><b><a href=\"(.*?)\">Leggi e commenta il post <\/a> su www.beppegrillo.it<\/b><\/p>/g,'');
			var content = el.find("description")
				.html()
				.replace(/<!--\[CDATA\[<p-->/g,'')
				.replace(/">Leggi e commenta il post <\/a> su www.beppegrillo.it<\/b><\/p>\]\]&gt;/g,'</span>')
				.replace(/<p><br><b><a href="/g,'<span class="final-link">')
				.replace(/<p><br \/><b><a href="(.*?)">Leggi e commenta il post <\/a> su www.beppegrillo.it<\/b><\/p>]]>/g,'');
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
				$('html:not(.yellow)').addClass('yellow');
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

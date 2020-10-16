$(document).ready(function() {
	
	function toTitleCase(str) {
	  return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
	}
	
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
	var xml_url = "https://www.ilblogdellestelle.it/feed";
	// var xml_url = "http://www.ilblogdellestelle.it/index.xml";
	// var xml_url = "http://www.beppegrillo.it/index.xml"
	var feed = "https://afternoon-hollows-35729.herokuapp.com/" + xml_url;

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
		// console.log(data,$(data).find("item"));
		//Credit: http://stackoverflow.com/questions/10943544/how-to-parse-an-rss-feed-using-javascript
		$(data).find("item").each(function () { // or "item" or whatever suits your feed
			var el = $(this), cat = [];
			var entry = document.importNode(document.querySelector('#article').content, true);
			// Exatract informations
			var link = el.find("link").text();
			var title = el.find("title").text();
			var categories = el.find("category");
			var creator = el.find("dc\\:creator").text();
			var comments = el.find("slash\\:comments").text();
			// var imgx;
			var kats = [];
			// Title with link
			entry.querySelector('h2 a').innerHTML = title;
			entry.querySelector('h2 a').href = link;
			// Set content
			// var content = el.find("description").text().replace(/<p><br \/><b><a href=\"(.*?)\">Leggi e commenta il post <\/a> su www.beppegrillo.it<\/b><\/p>/g,'');
			var content = el.find("content\\:encoded")
				.html()
				// .replace(/<!--\[CDATA\[<p-->/g,'')
				// .replace(/<!\[CDATA\[(.*)\]\]>/g, "$1")
				// .replace(/">Leggi e commenta il post <\/a> su www.beppegrillo.it<\/b><\/p>\]\]&gt;/g,'</span>')
				// .replace(/<p><br><b><a href="/g,'<span class="final-link">')
				// .replace(/<p><br \/><b><a href="(.*?)">Leggi e commenta il post <\/a> su www.beppegrillo.it<\/b><\/p>]]>/g,'')
				// 2018
				.replace(/<!\[CDATA\[/g, "")
				.replace(/<p>&nbsp;<\/p>/g,"")
				.replace(/<p><em>\s<\/em><\/p>/g,"")
				.replace(/<p><strong>\s<\/strong><\/p>/g,"")
				.replace(/<p>L\'articolo(.*)/g,"")
				.replace(/(.*)\]\]>/g,"");
			// image_src = content.match(/rel=\"image_src\" href=\"(.*?)\">/);
			// corrected = image_src;
			// if (image_src) {
			// 	frame = content.match(/<iframe ([\w\W]+?)><\/iframe>/);
			// 	poster_image = content.match(/<img alt=([\w\W]+?) src=\"(.*?)\"/);
			// 	source = (poster_image) ? poster_image[2] : image_src[1];
			// 	corrected = (image_src[1].match(/jpeg/)) ? image_src[1].replace(/jpeg/,'jpg').replace(/Imm/,'imm') : image_src[1].replace(/imm/,'Imm');
			// 	content = content.replace(/<img([\w\W]+?)\/>/,'');
			// 	imgx = "<img src='"+source+"' onerror='this.onerror=null;this.src=\""+corrected+"\";'>";
			// 	content = imgx + content;
			// }
			entry.querySelector('div').innerHTML = ((content.substring(0,2) !== '<p') ? '<p>' + content + '</p>' : content);
			console.log(content.substring(0,2));
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
			categories.map( function (i,c) {
				kats.push(entry.querySelector('header small').innerHTML += ((i !== 0) ? ', ' : '') + toTitleCase(c.innerHTML.replace(/<!\[CDATA\[(.*)\]\]>/g, "$1")));
			});
			// Add author
			entry.querySelector('header small').innerHTML += "<br><em>di " + creator + "</em>"
			// Add comments
			entry.querySelector('header small').innerHTML += " (" + comments + ")"
			// Check if article is viewed
			if (viewed.indexOf(link) === -1) {
				$('html:not(.yellow)').addClass('yellow');
				// Not viewed
				// viewed = viewed.slice(0, 10); // end is not included
				// Add new element
				viewed[viewed.length] = link;
				// limit array, strip firsts
				if(viewed.length>15){
					viewed = viewed.slice((viewed.length-15), viewed.length);
				}
				// Apply new class
				entry.querySelector('small').className += ' new';
			}

			// Add "save" button
			// var writeLink = document.createElement('a');
			// writeLink.classList.add('save-link');
			// writeLink.href = 'https://github.com/' + owner + '/' + repository + '/issues/new?title=' +
			// 	encodeURIComponent(title) + '&labels[]=' + kats + '&body=' +
			// 	encodeURIComponent('## [' + title + '](' + link + ')\n\n**' + date + '**\n\n<img src="' + corrected + '">');
			// // removed content: + encodeURIComponent(strip(en[i].content)[1])
			// writeLink.innerHTML = 'save';
			// entry.querySelector('small').appendChild(writeLink);

			// Add to DOM
			document.querySelector("section").appendChild(entry);
		}).promise().done( function(){
			// store viewed
			localStorage.setItem('viewedFinal', JSON.stringify(viewed));
		} );
	}
});

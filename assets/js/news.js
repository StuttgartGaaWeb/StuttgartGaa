(function() {
	'use strict';

	var newsList = document.getElementById('news-list');

	if (!newsList)
		return;

	function formatDate(dateValue) {
		var date = new Date(dateValue + 'T00:00:00');

		if (Number.isNaN(date.getTime()))
			return dateValue;

		return date.toLocaleDateString(undefined, {
			day: 'numeric',
			month: 'long',
			year: 'numeric'
		});
	}

	function getSafeUrl(urlValue) {
		try {
			var url = new URL(urlValue);

			if (url.protocol === 'http:' || url.protocol === 'https:')
				return url.href;
		} catch (error) {
			return null;
		}

		return null;
	}

	function createNewsCard(newsItem) {
		var card = document.createElement('article');
		var title = document.createElement('h3');
		var date = document.createElement('p');

		card.className = 'box news-card';
		title.textContent = newsItem.title;
		date.className = 'news-date';
		date.textContent = formatDate(newsItem.date);
		card.appendChild(title);
		card.appendChild(date);

		newsItem.body.forEach(function(paragraphText) {
			var paragraph = document.createElement('p');
			paragraph.textContent = paragraphText;
			card.appendChild(paragraph);
		});

		if (Array.isArray(newsItem.links)) {
			newsItem.links.forEach(function(newsLink) {
				var safeUrl = getSafeUrl(newsLink.url);

				if (!safeUrl || !newsLink.label)
					return;

				var link = document.createElement('a');
				link.className = 'button primary';
				link.href = safeUrl;
				link.target = '_blank';
				link.rel = 'noopener noreferrer';
				link.textContent = newsLink.label;
				card.appendChild(link);
			});
		}

		return card;
	}

	fetch('assets/news.json')
		.then(function(response) {
			if (!response.ok)
				throw new Error('Unable to load announcements.');

			return response.json();
		})
		.then(function(newsItems) {
			newsList.innerHTML = '';

			newsItems
				.filter(function(newsItem) {
					return newsItem.title && newsItem.date && Array.isArray(newsItem.body);
				})
				.sort(function(firstItem, secondItem) {
					var firstTimestamp = new Date(firstItem.date + 'T00:00:00').getTime();
					var secondTimestamp = new Date(secondItem.date + 'T00:00:00').getTime();

					return secondTimestamp - firstTimestamp;
				})
				.forEach(function(newsItem) {
					newsList.appendChild(createNewsCard(newsItem));
				});
		})
		.catch(function() {
			newsList.innerHTML = '<p>Announcements are currently unavailable. Please check back soon.</p>';
		});
})();

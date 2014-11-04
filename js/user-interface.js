var mwjs = MediaWikiJS('https://en.wikipedia.org');
var originalPage = 'Design';

$(function(){
	relayout();
	
	$( "#cloud" ).draggable({
		start: function(event, ui) {
			$(this).addClass('drag');
		},
		stop: function(event, ui) {
			$(this).removeClass('drag');
		}
	});
	
	navigate();
	
	$("#remap-button").click(function(){
		remapCloud();
	});
	
	$("#left-button").click(function(){
		var newX = $("#cloud").position().left + ( $("#cloud-wrapper").width() - 200 );
		$("#cloud").css('left',  newX + 'px');
	});
	
	$("#right-button").click(function(){
		var newX = $("#cloud").position().left - ( $("#cloud-wrapper").width() - 200 );
		$("#cloud").css('left',  newX + 'px');
	});
	
	$("#top-button").click(function(){
		var newX = $("#cloud").position().top + ( $("#cloud-wrapper").width() - 200 );
		$("#cloud").css('top',  newX + 'px');
	});
	
	$("#bottom-button").click(function(){
		var newX = $("#cloud").position().top - ( $("#cloud-wrapper").width() - 200 );
		$("#cloud").css('top',  newX + 'px');
	});
	
	$('#search-button').click(function(){
		originalPage = $('#search-input').val();
		$('#search-input').val('');
		navigate();
	});
});

$( window ).resize(function() {
	relayout();
});

function relayout() {
	if( $(window).width() > 768 && $(window).width() > $(window).height() ) {
		$('#cloud-wrapper').height( $(window).height() );
		$('#article').height( $(window).height() );
		$('#cloud-wrapper').css('width', '65%');
		$('#article').css('width', '35%');
		$('#cloud-wrapper').css('top', '0');
		$('#cloud-wrapper').css('left', '0');
		$('#article').css('top', '0');
		$('#article').css('left', '65%');
	} else {
		$('#cloud-wrapper').height( $(window).height() / 2 );
		$('#article').height( $(window).height() / 2 );
		$('#cloud-wrapper').css('width', '100%');
		$('#article').css('width', '100%');
		$('#cloud-wrapper').css('top', '0');
		$('#cloud-wrapper').css('left', '0');
		$('#article').css('top', '50%');
		$('#article').css('left', '0');
	}
}

function remapCloud () {
	// When window was resized
	var linkNumber = $(".link").length;
	var linkColumn = Math.ceil(Math.sqrt(linkNumber*1.5));
	var linkRow = linkColumn;
	var cloudWidth = Math.ceil(Math.sqrt(linkNumber*1.5)) * 100;
	var cloudHeight = cloudWidth;
	$("#cloud").width(cloudWidth);
	$("#cloud").height(cloudHeight);
	$("#cloud").css('left', $("#cloud-wrapper").width() / 2 - cloudWidth / 2 + 'px');
	$("#cloud").css('top', $("#cloud-wrapper").height() / 2 - cloudHeight / 2 + 'px');
	var randomIndex = [];
	for( var i = 0; i < linkColumn * linkRow; i++ ) {
		randomIndex.push(i);
	}
	for( var i = 0; i < linkColumn * linkRow; i++ ) {
		var j = Math.floor(Math.random() * linkColumn * linkRow);
		var temp = randomIndex[i];
		randomIndex[i] = randomIndex[j];
		randomIndex[j] = temp;
	}
	$(".link").each( function (index) {
		var x = ( randomIndex[index] + 1 ) % linkColumn * 100 - 85 + 70 * Math.random() ;
		var y = Math.floor( ( randomIndex[index] + 1 ) / linkRow ) * 100 + 15 + 70 * Math.random();
		$(this).css('left', x + 'px');
		$(this).css('top', y + 'px');
	});
}

function getLinks ( page ) {
	var query = { action: 'query', prop: 'links', titles: page, plnamespace: 0, continue: '' };
	getLinksQuery(query);
}

function getLinksQuery( query) {
	mwjs.send( query, function (data) {
		var pages = data.query.pages;
		var links = pages[Object.keys(pages)[0]].links;
		
		for( var i = 0; i < links.length; i++ ) {
			var x = ( 100 * Math.random() ) + '%';
			var y = ( 100 * Math.random() ) + '%';
			var bg = Math.floor(128*Math.random() + 128) + ',' + Math.floor(128*Math.random() + 128) + ',' + Math.floor(128*Math.random() + 128);
			$("#cloud").append('<div class="link" style="background:rgb(' + bg +');left:' + x + ';top:' + y + ';"><span>' + links[i].title + '</span></div>');
		}
		
		if( typeof(data.continue) !== 'undefined' ) {
			query['continue'] = data.continue.continue;
			query['plcontinue'] = data.continue.plcontinue;
			getLinksQuery(query);
		} else {
			remapCloud ();
			
			$('.link').click(function(){
				if(!$(this).hasClass('noclick')){
					originalPage = $(this).find('span').text();
					navigate();
				} else {
					$(this).removeClass('noclick');
				}
			});
			
			$( ".link" ).draggable({
				start: function(event, ui) {
					$(this).addClass('noclick');
					$(this).addClass('drag');
				},
				stop: function(event, ui) {
					$(this).removeClass('drag');
				}
			});
		}
	});
}

function navigate() {
	$('.link').remove();
	$('#page').data('page', originalPage);
	$('#page').text(originalPage);
	$('#article iframe').attr('src', "https://en.m.wikipedia.org/w/index.php?title=" + originalPage);
	$('#cloud').css('width', '100%').css('height', '100%').css('left', '0').css('top', '0');
	getLinks(originalPage);
}
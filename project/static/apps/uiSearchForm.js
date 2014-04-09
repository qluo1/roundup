var uiSearchFrom = flight.component (function(){
	
	this.defaultAttrs({

		uiSearchSelector: "#ui_search",
		uiSearchFormSelector: "#ui_search > form",
		uiSearchSubmit: "#search",
		uiSearchResult: "#ui_search #search_result",
		hide: true

	});

	this.render = function (ev,data) {

		if (this.attr.hide){
			$(this.attr.uiSearchFormSelector).hide().remove();
			$(this.attr.uiSearchSelector).append(data.html).show();
			this.attr.hide = false;
		}
	}

	this.submitSearch = function(ev,data) {

		var data = $(this.attr.uiSearchFormSelector).serializeArray();
		console.log("search data: " + data);
		this.trigger(document,"uiSearchItems", {data:data});
		ev.preventDefault();
	}

	this.searchResult = function(ev,data){

		if (!this.attr.hide){
			$(this.attr.uiSearchResult).children().hide().remove()
			$(this.attr.uiSearchResult).append(data.html).show();
		}
	}

	this.hideSearch = function(ev,data){
		
		if (!this.attr.hide) {
			$(this.attr.uiSearchFormSelector).hide().remove();	
			this.attr.hide = true;
		}
	}

	this.after("initialize",function(){

		this.on(document,"dataSearch", this.render);
        this.on(document,"loadIssuelist",this.hideSearch);
        this.on(document,"loadIssue",this.hideSearch);
        this.on(document,'dataSearchResult', this.searchResult);

		this.on('click', {
			'uiSearchSubmit': this.submitSearch,
		});

	});

});


uiSearchFrom.attachTo("#ui_search");


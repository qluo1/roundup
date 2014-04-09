var uiSearchFrom = flight.component (function(){
	
	this.defaultAttrs({

		uiSearchSelector: "#ui_search",
		uiSearchFormSelector: "#ui_search > form",
		uiSearchSubmit: "#search",
		uiSearchResult: "#ui_search > #search_result",
		uiClickSearchItem: "#ui_search > #search_result a",
		hide: true

	});

	this.render = function (ev,data) {

		if (this.attr.hide){
			// hide previous search result
			$(this.attr.ui_search).children().hide().remove();	
			// hide search form 
			$(this.attr.uiSearchFormSelector).hide().remove();
			// show search form
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
			//remove previous search result
			$(this.attr.uiSearchResult).children().hide().remove();
			$(this.attr.uiSearchResult).append(data.html).show();
		}
	}

	this.hideSearch = function(ev,data){
		
		if (!this.attr.hide) {
			/* remove search */
			$(this.attr.uiSearchSelector).html("");
			this.attr.hide = true;
		}
	}

	this.clickSearchItem = function(ev,data){

		alert("clicked:" + ev.target.pathname);
		this.trigger("loadIssue",{item: ev.target.pathname});
		ev.preventDefault();

	}

	this.after("initialize",function(){

		this.on(document,"dataSearch", this.render);
        this.on(document,"loadIssuelist",this.hideSearch);
        this.on(document,"loadIssue",this.hideSearch);
        this.on(document,'dataSearchResult', this.searchResult);

		this.on('click', {
			'uiSearchSubmit': this.submitSearch,
			'uiClickSearchItem': this.clickSearchItem
		});

	});

});


uiSearchFrom.attachTo("#ui_search");


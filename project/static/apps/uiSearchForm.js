var uiSearchFrom = flight.component (function(){
	
	this.defaultAttrs({

		uiSearchSelector: "#ui_search",
		uiSearchFormSelector: "#ui_search > form",
		uiSearchSubmit: "#search",
		uiSearchResult: "#ui_search > #search_result",
		uiClickSearchItem: "#ui_search > #search_result table a",
		hide: true

	});

	this.render = function (ev,data) {

		if (this.attr.hide){
			if ($(this.attr.uiSearchResult).html() == undefined) {
				/* no previous result, show new search form*/
				$(this.attr.uiSearchSelector).append(data.html).show();

			}else{
				/* show old search result*/
				$(this.attr.uiSearchSelector).show();
			}
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
			/*remove previous search result*/
			$(this.attr.uiSearchResult).html("");
			$(this.attr.uiSearchResult).append(data.html).show();
		}
	}

	this.hideSearch = function(ev,data){
		
		if (!this.attr.hide) {
			/* hide current search */
			$(this.attr.uiSearchSelector).hide();
			this.attr.hide = true;
		}
	}

	this.clickSearchItem = function(ev,data){

		this.trigger("loadIssue",{item: ev.target.pathname});
		ev.preventDefault();

	}

	this.paginateSearchItem = function(ev,data){

		if (data.item == "search") {
			var page = data.page;
			var data = $(this.attr.uiSearchFormSelector).serializeArray();
			data.push({name:"page",value:page});
			console.log("search data: " + data);
			this.trigger(document,"uiSearchItems", {data:data});
			ev.preventDefault();
		}
		
	}

	this.after("initialize",function(){

		this.on(document,"dataSearch", this.render);
        this.on(document,"loadIssuelist",this.hideSearch);
        this.on(document,"loadIssue",this.hideSearch);
        this.on(document,'dataSearchResult', this.searchResult);
        this.on(document,"uiPagination", this.paginateSearchItem);

		this.on('click', {
			'uiSearchSubmit': this.submitSearch,
			'uiClickSearchItem': this.clickSearchItem,
		});

	});

});


uiSearchFrom.attachTo("#ui_search");


var uiPagination = flight.component (function(){
	
	this.defaultAttrs({

		uiPaginationSelector: ".pagination",
		uiPageSelector: ".pagination > li >a",
		uiDataAttr: "data"
	});

	this.onClick = function(ev,data){

		var page = ev.target.attributes['data-id'].value
		var item = ev.currentTarget.attributes['data-id'].value

		this.trigger(document,"uiPagination", {page: page, item: item});
		console.log("uiPagination on" + page + " " + item);
		
		ev.preventDefault();
	}

	this.after("initialize",function(){

		this.on("click", {
			"uiPageSelector": this.onClick
		});
	});

});


var dataMain = flight.component(function(){
    // main data component
    
    this.defaultAttrs({
        status: "bug",
        priority: "",
        url_issueList: "/api/list",
        url_issue: "/api"
    });

    this.loadIssuelist = function() {

        var url = this.attr.url_issueList;
        var that = this;    

        if (this.attr.status){
            url += "?status=" + this.attr.status
        }
        
        if (this.attr.priority){
            url += "&priority=" + this.attr.priority
        }
        
        $.get(url,function(data){
            that.trigger("dataIssueList",{html:data});
        });
    }

    this.loadIssue = function(e,data) {
        
        var url = this.attr.url_issue + data.item
        var that = this;
        $.get(url,function(data){
            that.trigger("dataIssue",{html:data});
        });
    }

    this.after("initialize",function(){
        
        this.on(document,"loadIssuelist",this.loadIssuelist);
        this.on(document,"loadIssue",this.loadIssue);

        /* kick start load issues*/
        this.trigger("loadIssuelist",{});
    });
});


var uiMain = flight.component(function() {

    /* attrs*/
    this.defaultAttrs({
        /*selector*/
        issueSelector:     "#ui_issue",
        issueNewSelector:  "#ui_new",
        issueListSelector: "#ui_list",
        
        itemSelector:      "#ui_list a"
    });

    this.selectIssue = function (event,data){

        this.trigger("loadIssue",{item: event.target.pathname});
        event.preventDefault();
    }

    this.renderIssueList = function(e,data) {

        this.select("issueNewSelector").html("");
        this.select("issueSelector").html("");
        this.select('issueListSelector').html(data.html);
    }

    this.renderIssue = function(e,data) {

        this.select("issueNewSelector").html("");
        this.select("issueListSelector").html("");
        this.select('issueSelector').html(data.html);
    }

    this.renderIssueNew = function(ev,data){
        
        this.select("issueListSelector").html("");
        this.select('issueSelector').html("");
        this.select("issueNewSelector").html(data.html);
    }

    this.after('initialize',function(){

        this.on('click', {

            "itemSelector": this.selectIssue
        
        });

        this.on(document,'dataIssueList',this.renderIssueList);
        this.on(document,'dataIssue',this.renderIssue);
        this.on(document,'dataIssueNew',this.renderIssueNew);
    });

});

// DEBUG.events.logAll();
dataMain.attachTo(document);
uiMain.attachTo("#ui",{});

var dataMain = flight.component(function(){
    // main data component
    
    this.defaultAttrs({
        status: "bug",
        priority: "",
        url_issueList: "/api/list",
        url_issue: "/api",
        url_issue_new: "/api/new",
        url_issue_search: "/api/search"
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

    this.loadIssue = function(ev,data) {
        
        var url = this.attr.url_issue + data.item;
        var that = this;
        $.get(url,function(data){
            that.trigger("dataIssue",{html:data});
        });
    }

    this.loadNewIssue = function(ev,data){
        var url = this.attr.url_issue_new;
        var that = this;
        $.get(url,function(data){
            that.trigger("dataIssueNew",{html:data});
        });
    }

    this.postNewIssue = function(ev,data){
        var url = this.attr.url_issue_new;
        var that = this;
        $.post(url,data.data, function(out){
            console.log("return:" + out);
            that.trigger("loadIssuelist",{});
            that.trigger("ok",{msg:"new issue[" + out.id + "] added"});
        });
        console.log("posting new issue in data comp:" + data.data);
        
    }

    this.loadSearch = function(ev,data){
        var url = this.attr.url_issue_search;
        var that = this;
        $.get(url,function(data){
            that.trigger("dataSearch",{html:data});
        });
    }

    this.postItemSearch = function(ev,data){
        var url = this.attr.url_issue_search;
        var that = this;
        $.post(url,data.data,function(out){
            console.log("search return: " + out);
            that.trigger("dataSearchItems",{html:data});
        });

    }

    this.after("initialize",function(){
        
        this.on(document,"loadIssuelist",this.loadIssuelist);
        this.on(document,"loadIssue",this.loadIssue);
        this.on(document,"uiNewIssue",this.loadNewIssue);
        this.on(document,"uiPostNewIssue",this.postNewIssue);
        this.on(document,"uiSearch",this.loadSearch);
        this.on(document,"uiSearchItems",this.postItemSearch);

        /* kick start load issues*/
        this.trigger("loadIssuelist",{});
    });
});

var uiMain = flight.component(function() {

    /* attrs*/
    this.defaultAttrs({
        /*selector*/
        issueSelector:      "#ui_issue",
        issueNewSelector:   "#ui_new",
        issueListSelector:  "#ui_list",
        
        itemSelector:       "#ui_list a",
        itemSubmitSelector: "#ui_issue > form",
        itemNewSubmitSelector: "#ui_new > form"
    });

    this.selectIssue = function (ev,data){

        this.trigger("loadIssue",{item: ev.target.pathname});
        ev.preventDefault();
    }

    this.submitIssue = function(ev,data){
        
        console.log( this.select("itemSubmitSelector").serializeArray());
        ev.preventDefault();
        
    }

    this.submitNewIssue = function(ev,data){
        
       console.log(this.select("itemNewSubmitSelector").serializeArray());
       ev.preventDefault();
       // TODO: validation
       this.trigger("uiPostNewIssue",{data: this.select("itemNewSubmitSelector").serializeArray()});
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

    this.hide = function(ev,data){
        this.select("issueListSelector").html("");
        this.select('issueSelector').html("");
        this.select("issueNewSelector").html("");
    }

    this.after('initialize',function(){

        this.on('click', {

            "itemSelector": this.selectIssue
        
        });
        this.on('submit',{

            "itemSubmitSelector": this.submitIssue,
            "itemNewSubmitSelector": this.submitNewIssue
        })

        this.on(document,'dataIssueList',this.renderIssueList);
        this.on(document,'dataIssue',this.renderIssue);
        this.on(document,'dataIssueNew',this.renderIssueNew);
        this.on(document,'dataSearch',this.hide);

    });
});

var uiMenu = flight.component(function(){

    this.defaultAttrs({
        menuSelector: ".navigation",
        editQuerySelector: "#js-edit-query",
        newIssueSelector: "#js-new-issue",
        showAllSelector: "#js-show-all",
        showIssueSelector: "#js-show-issue",
        searchSelector: "#js-search"
    });


    this.editQuery = function(ev,data){

        console.log("editQuery");
        console.log(ev.target);
        ev.preventDefault();
    }

    this.newIssue = function(ev,data){
        console.log("newIssue");
        console.log(ev.target);
        this.trigger("uiNewIssue",{});
        ev.preventDefault();
    }

    this.showAll = function(ev,data){
        console.log("showall");
        this.trigger("loadIssuelist",{});
        ev.preventDefault();
    }

    this.showIssue = function(ev,data){
        console.log("showIssue");
        console.log(this.select("showIssueSelector").serializeArray());
        var data = this.select("showIssueSelector").serializeArray();

        if (data && data[0].value){
            this.trigger("loadIssue",{item:"/issue"+ data[0].value});
        }
        ev.preventDefault();
    }

    this.search = function(ev,data){
        console.log("search issue");
        this.trigger("uiSearch",{});
        ev.preventDefault();
    }

    this.after("initialize",function(){

        this.on("click",{

            "editQuerySelector": this.editQuery,
            "newIssueSelector": this.newIssue,
            "showAllSelector": this.showAll,
            "searchSelector": this.search
        });

        this.on("submit",{
            "showIssueSelector": this.showIssue
        });
    })
});


/* load app templates */
var args = {
    path : '/static/apps/templates.hbs',
    sync : true
}
Handlebars.Loader.load(args);

dataMain.attachTo(document);
uiMain.attachTo("#ui",{});
uiMenu.attachTo(".navigation");
// enable debug logging 
// DEBUG.events.logAll();
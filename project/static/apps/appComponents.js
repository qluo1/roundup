var dataMain = flight.component(function(){
    // main data component
    
    this.defaultAttrs({
        status: "bug",
        priority: "",
        url_issueList: "/api/list",
        url_issue: "/api",
        url_issue_new: "/api/new"
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
        $.post(url,data.data, function(data){
            console.log("return:" + data);
            that.trigger("loadIssuelist",{});
            that.trigger("okMessage",{msg:"new issue[" + data.id + "] added"});
        });
        console.log("posting new issue in data comp:" + data.data);
        
    }

    this.after("initialize",function(){
        
        this.on(document,"loadIssuelist",this.loadIssuelist);
        this.on(document,"loadIssue",this.loadIssue);
        this.on(document,"uiNewIssue",this.loadNewIssue);
        this.on(document,"uiPostNewIssue",this.postNewIssue);

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
        
        itemSelector:      "#ui_list a",
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

    });

});


var uiMenu = flight.component(function(){

    this.defaultAttrs({
        menuSelector: ".navigation",
        editQuerySelector: "#js-edit-query",
        newIssueSelector: "#js-new-issue",
        showAllSelector: "#js-show-all",
        showIssueSelector: "#js-show-issue"
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

    this.after("initialize",function(){

        this.on("click",{

            "editQuerySelector": this.editQuery,
            "newIssueSelector": this.newIssue,
            "showAllSelector": this.showAll,
            "showIssueSelector": this.showIssue
        });
    })

});


var uiFlashMessage = flight.component(function(){

    this.defaultAttrs({
        okSelector: ".alert-success",
        okMsgSelector: ".alert-success > strong",
        errSelector: ".alert-danger",
        errMsgSelector: ".alert-danger > strong"
    });


    this.okMessage = function(ev,data){
        console.log("okMessage:" + data.msg);
        // this.select(this.attr.errSelector).hide();
        // this.select(this.attr.okSelector).show();
        // this.select(this.attr.okMsgSelector).text(data.msg);
        $(".alert-danger").hide();
        $(".alert-success > strong").text(data.msg);
        $(".alert-success").slideDown();

        setTimeout(function(){
            $(".alert-success").slideToggle();
        },3000);

    }

    this.errMessage = function(ev,data){
        console.log("errMessage:" + data.msg);
        $(".alert-success").hide();
        $(".alert-danger").show();
        $(".alert-danger > strong").text(data.msg);

        setTimeout(function(){
            $(".alert-danger").fadeIn();
        },3000);
    }

    this.after("initialize",function(){

        this.on(document,"okMessage",this.okMessage);
        this.on(document,"errorMessage",this.errMessage);
        $(".alert").hide();
    });

});

dataMain.attachTo(document);
uiMain.attachTo("#ui",{});
uiMenu.attachTo(".navigation");
uiFlashMessage.attachTo("#flashMessage");
// enable debug logging
DEBUG.events.logAll();
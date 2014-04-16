
var dataMain = flight.component(function(){
    // main data component
    
    this.defaultAttrs({
        status: "bug",
        priority: "",
        url_issueList: "api/list",
        url_issue: "api",
        url_issue_new: "api/new",
        url_issue_update: "api/update",
        url_msg_remove: "api/remove",
        url_issue_search: "api/search",
        url_register: "api/register"

    });

    this.loadIssuelist = function(ev,data) {

        var url = this.attr.url_issueList;
        var that = this;    

        if (this.attr.status){
            url += "?status=" + this.attr.status
        }
        
        if (this.attr.priority){
            url += "&priority=" + this.attr.priority
        }

        if (data.page) {
            url += "&page=" + data.page;
        }
        
        $.get(url,function(data){
            that.trigger("dataIssueList",{html:data});
        });
    }

    this.loadIssue = function(ev,data) {
        
        var url  = this.attr.url_issue + "/";
        /* workaround IE8 , Firefox difference */
        var strarray = data.item.split("/");
        /* last item*/
        var issue = strarray[strarray.length-1];
        url += issue;
        var that = this;
        $.get(url,function(data){
            that.trigger("dataIssue",{html:data,issue:issue});
        });
    }

    this.loadNewIssue = function(ev,data){
        var url = this.attr.url_issue_new;
        var that = this;
        if (data.item !== "/") {
            $.get(url,function(data){
                that.trigger("dataIssueNew",{html:data});
            });
        }
    }

    this.postNewIssue = function(ev,data){
        var url = this.attr.url_issue_new;
        var that = this;
        $.post(url,data.data, function(out){
            console.log("return:" + out);
            that.trigger("loadIssuelist",{});
            if (out.status == 'ok'){
                that.trigger("ok",{msg:"new issue[" + out.id + "] added"});    
            }else{
                that.trigger("error",{msg:"failed: "+ out.message});    
            }
            
        });
        console.log("posting new issue in data comp:" + data.data);
        
    }

    this.postUpdatedIssue = function(ev,data){
        var url = this.attr.url_issue_update;
        var that = this;

        $.post(url,data.data,function(out){
            console.log("return: " + out);
            if (out.status == 'ok'){
                that.trigger("ok",{msg:"issue[" + out.id + "] updated"});    
                that.trigger("loadIssue",{item:"issue"+ out.id});
            }else{
                that.trigger("error",{msg:"failed: "+ out.message});       
            }
        });

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
            // console.log("search return: " + out);
            that.trigger(document,"dataSearchResult",{html:out});
        });

    }

    this.pagination = function(ev,data){

        var item = data.item;
        var page = data.page;
        var that = this;
        console.log("load page data");
        
        if (item == "issue"){
            var url = this.attr.url_issueList;

            if (data.page) {
                url += "?page=" + data.page;
                $.get(url,function(data){
                    that.trigger("dataIssueList",{html:data});
                });
            } 
        } /* issue pagination */
    }

    this.removeIssueMsg = function(ev,data) {

        console.log("remove issue message");
        var that = this;
        var url = this.attr.url_msg_remove;
        $.post(url,data.data,function(out){
            if (out.status == "ok") {
                that.trigger("loadIssue",{item:"/issue"+ out.id});
                that.trigger("ok",{msg:"issue[" + out.id + "] updated"});
            }else{
                // TODO alert
            }
        });
    }

    this.viewMsg = function(ev,data) {
        
        var url = this.attr.url_issue + "/";
        var strarray = data.item.split("/");

        url += strarray[strarray.length - 1];

        if (data.item.slice(0,1) == "/") {
            url += data.item;    
        }else{
            url += "/" + data.item;
        }
        
        var that = this;
        $.get(url,function(out){
            console.log(out);
            that.trigger(document,"dataMsgView",{html:out});
        });
    }

    this.regNewUser = function(ev,data){
        var url = this.attr.url_register;
        var that = this;
        $.post(url,data.data,function(out){
            if (out.status == "ok"){
                that.trigger(document,"ok",{msg:"new user added! " + out.id});    
            }else{
                that.trigger(document,"error",{msg:"failed: " + out.msg});
            }
            
        });

    }

    this.after("initialize",function(){
        
        this.on(document,"loadIssuelist",this.loadIssuelist);
        this.on(document,"loadIssue",this.loadIssue);
        this.on(document,"uiNewIssue",this.loadNewIssue);
        this.on(document,"uiPostNewIssue",this.postNewIssue);
        this.on(document,"uiPostUpdatedIssue",this.postUpdatedIssue);
        this.on(document,"uiSearch",this.loadSearch);
        this.on(document,"uiSearchItems",this.postItemSearch);
        this.on(document,"uiPagination", this.pagination);
        this.on(document,"uiRemoveMsg", this.removeIssueMsg);
        this.on(document,"uiMsgView", this.viewMsg);
        this.on(document,"uiNewUser", this.regNewUser);
        

        /* kick start load issues*/
        this.trigger("loadIssuelist",{});
    });
});

var uiMain = flight.component(function() {

    /* attrs*/
    this.defaultAttrs({
        /*selector*/
        issueSelector:          "#ui_issue",
        issueNewSelector:       "#ui_new",
        issueListSelector:      "#ui_list",
        msgSelector:            "#ui_msg",

        itemSelector:           "#ui_list table a",
        itemSubmitSelector:     "#ui_issue > form",
        itemNewSubmitSelector:  "#ui_new > form",
        msgRemoveBtnSelector:   "#ui_issue form.js-form-inline",
        msgViewClickSelector:   "#ui_issue div#js-messages a",

        uploadfileSelector:     "#ui_issue div#js-uploadfile"

    });

    this.selectIssue = function (ev,data){

        var item = ev.target.pathname
        
        this.trigger("loadIssue",{item: item});
        ev.preventDefault();
    }

    this.submitIssue = function(ev,data){
        
        console.log("submit updated issue");

        var data = this.select("itemSubmitSelector").serializeArray();
         // var data = new FormData($(this.attr.itemSubmitSelector)[0]);
        //data.file = $("#ui_issue > form #file_upload").val();
        if (this.uploadObj !== undefined){
            this.uploadObj.startUpload();
            this.uploadObj = undefined;
        }
        this.trigger("uiPostUpdatedIssue",{data:data});
         

        ev.preventDefault();
    }

    this.submitNewIssue = function(ev,data){
        
       console.log(this.select("itemNewSubmitSelector").serializeArray());
       // TODO: validation
       this.trigger("uiPostNewIssue",{data: this.select("itemNewSubmitSelector").serializeArray()});
       ev.preventDefault();
    }

    this.renderIssueList = function(e,data) {

        // this.select("issueNewSelector").html("");
        // this.select("issueSelector").html("");
        this.hide();
        this.select('issueListSelector').html(data.html);
    }

    this.renderIssue = function(e,data) {

        this.hide();
        this.select('issueSelector').html(data.html);
        // attach upload file
        this.uploadObj = $(this.attr.uploadfileSelector).uploadFile({
            url: "api/uploadfile",
            autoSubmit:false,
            formData: {"issue":data.issue}
        });
    }

    this.renderIssueNew = function(ev,data){
        
        this.hide();
        this.select("issueNewSelector").html(data.html);
    }

    this.hide = function(ev,data){
        this.select("issueListSelector").html("");
        this.select('issueSelector').html("");
        this.select("issueNewSelector").html("");
        this.select("msgSelector").html("");
    }

    this.submitRemoveMsg = function(ev,data) {
        var data = $(this.attr.msgRemoveBtnSelector).serializeArray();
        this.trigger(document,"uiRemoveMsg",{data:data});
        ev.preventDefault();
    }

    this.msgViewClick = function(ev,data) {
        var item = ev.target.pathname
        // alert("msg click: " + path);
        this.trigger(document,"uiMsgView",{item: item});
        ev.preventDefault();
    }

    this.renderMsg = function(ev,data){
        this.hide();
        this.select("msgSelector").html(data.html);
    }

    this.after('initialize',function(){

        this.on('click', {

            "itemSelector": this.selectIssue,
            "msgViewClickSelector": this.msgViewClick
        
        });
        this.on('submit',{

            "itemSubmitSelector": this.submitIssue,
            "itemNewSubmitSelector": this.submitNewIssue,
            "msgRemoveBtnSelector" : this.submitRemoveMsg
        })

        this.on(document,'dataIssueList',this.renderIssueList);
        this.on(document,'dataIssue',this.renderIssue);
        this.on(document,'dataIssueNew',this.renderIssueNew);
        this.on(document,'dataSearch',this.hide);
        this.on(document,'dataMsgView',this.renderMsg);
        this.on(document,'uiRegister',this.hide);

    });
});

var uiMenu = flight.component(function(){

    this.defaultAttrs({
        menuSelector: ".navigation",
        editQuerySelector: "#js-edit-query",
        newIssueSelector: "#js-new-issue",
        showAllSelector: "#js-show-all",
        showIssueSelector: "#js-show-issue",
        searchSelector: "#js-search",
        registerSelector: "#js-register",
        forgottenSelector: "#js-forgotten"
    });


    this.editQuery = function(ev,data){

        console.log("editQuery");
        console.log(ev.target);
        ev.preventDefault();
    }

    this.newIssue = function(ev,data){
        console.log("newIssue");
        console.log(ev.target);
        this.trigger(document,"uiNewIssue",{});
        ev.preventDefault();
    }

    this.showAll = function(ev,data){
        console.log("showall");
        this.trigger(document,"loadIssuelist",{});
        ev.preventDefault();
    }

    this.showIssue = function(ev,data){
        console.log("showIssue");
        console.log(this.select("showIssueSelector").serializeArray());
        var data = this.select("showIssueSelector").serializeArray();

        if (data && data[0].value){
            this.trigger("loadIssue",{item:"issue"+ data[0].value});
        }
        ev.preventDefault();
    }

    this.search = function(ev,data){
        console.log("search issue");
        this.trigger(document,"uiSearch",{});
        ev.preventDefault();
    }

    this.register = function(ev,data){
        console.log("register");
        this.trigger(document,"uiRegister",{});
        ev.preventDefault();
    }
    this.forgotten = function(ev,data){
        console.log("forgotten");
        this.trigger(document,"uiForgotten",{});
        ev.preventDefault();
    }

    this.after("initialize",function(){

        this.on("click",{

            "editQuerySelector": this.editQuery,
            "newIssueSelector": this.newIssue,
            "showAllSelector": this.showAll,
            "searchSelector": this.search,
            "registerSelector": this.register,
            "forgottenSelector": this.forgotten
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
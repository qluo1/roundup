var uiRegister = flight.component(function(){
	this.defaultAttrs({
		
		uiRegisterSelector: "#ui_register",
		uiRegisterFormSelector: "#ui_register > form.js-register",
		uiRegisterSubmitSelector: "#ui_register > form.js-register button",
		templateName: "registerTemplate",
		hide: true
	});


	this.render = function(ev,data) {
		// render ui form
		if(this.attr.hide) {
			var html = Handlebars.Templates.get(this.attr.templateName,{});
			$(this.attr.uiRegisterSelector).html(html);
			this.attr.hide = false;
		}
	}

	this.hide = function(ev,data) {
		if (!this.attr.hide) {

			$(this.attr.uiRegisterSelector).html("");
			this.attr.hide = true;
		}
	}

	this.submitRegister = function(ev,data){

		console.log("submit");
		var data = $(this.attr.uiRegisterFormSelector).serializeArray();
		var realname = data[0].value;
		var username = data[1].value;
		var pwd = data[2].value;
		var confirm_pwd = data[3].value;
		var phone =data[4].value;
		var email = data[5].value;

		if (username && realname && pwd && confirm_pwd && email){

			if (pwd !== confirm_pwd){
				this.trigger(document,"error",{msg:"password doesnt' match!"});
			}else{
				this.trigger(document,"uiNewUser",{data:data});
			}

		}else{

			this.trigger(document,"error",{msg:"missing required fields!"});
		}

		ev.preventDefault();
	}

	this.after('initialize',function(){

		this.on("click", {
			"uiRegisterSubmitSelector": this.submitRegister
		});

		this.on(document,"uiRegister",this.render);

		this.on(document,"uiNewIssue",this.hide);
		this.on(document,"loadIssueList",this.hide);
		this.on(document,"uiClickSearchItem",this.hide);
	});

});

uiRegister.attachTo("#ui_register");

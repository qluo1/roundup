var uiFlashMessage = flight.component(function()
{
  this.defaultAttrs({
    msgboard: '#flashMessage',
    msg:      '#flashMessage > p',
  });

  var source = "<p class='alert {{style}} alert-dismissable'>\
      <button type='button' class='close' data-dismiss='alert'>&times;</button>\
      {{message}} </p>"

  this.template = Handlebars.compile(source);

  this.flash_message = function(html,timeout) {

    $(this.attr.msgboard).hide().append(html).slideDown(500);
    var that = this;
    setTimeout(function(){
      $(that.attr.msg).slideToggle().remove();
    },timeout);

  }
  this.ok_message = function(ev,data){
    var context = {
      style: 'alert-success',
      message: data.msg
    }
    var html = this.template(context);
    this.flash_message(html,3000);

  }

  this.error_message = function(ev,data){
    var context = {
      style: 'alert-danger',
      message: data.msg
    }
    var html = this.template(context);
    this.flash_message(html,3000);
  }

  this.after("initialize",function(){
    this.on(document,"ok",this.ok_message);
    this.on(document,"error",this.error_message);

  });
  
});

uiFlashMessage.attachTo(document);


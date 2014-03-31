//Handlebars Template helper
(function(Handlebars){
 
    Handlebars.Templates = {
 
        //script type of handle bar template
        TYPE: "text/x-handlebars-template",
         //Handlebar identifier attribute
        NAME: "data-template-name",
         //Template Store.
        _store: {},
 
 
        //Get the template from template store
        get: function(templateName, context){
 
            var template = this._store[templateName];
            if(context){
                template = template(context);
            }
            return template;
         },
 
        //Add the template to the template store.
        add: function(templateName, templateContent){
 
            var template = Handlebars.compile(templateContent);
            this._store[templateName] = template;
            return template;
         },
 
        //Remote the template from the Templates store
        remove: function(templateName){
 
            this._store[templateName] = null;
            delete this._store[templateName];
         },
 
        //Process the entire DOM for handlebar templates
        process: function(){
 
            var found = false;
 
            //Handle loading multiple templates
            $('script[type="'+Handlebars.Templates.TYPE+'"]')
                .each(function(){
                    Handlebars.Templates.processTemplate(this);
                    found = true;
                 }
            );
            return found;
        },
 
        //Process individual handlebar script
        processTemplate: function(el){
 
            //Access the handlebar template
            var handlebarTemplate = $(el),
                        template;
             //Add template to templateStore
            template = Handlebars.Templates.add(
                handlebarTemplate.attr(Handlebars.Templates.NAME),
                handlebarTemplate.text()
            );
            //Cleanup DOM once processed
            handlebarTemplate.remove();
 
            return template;
        }
 
    };
})(Handlebars);

/* Basic Handlebars Loader */
(function(Handlebars, $){
 
    Handlebars.Loader = {
 
        load: function(args){
            args = args || {};
 
            $.ajax({
                url: args.path,
                async: !args.sync,
                type: "GET",
                cache: true
            }, "html")
                .success(function(data, status ,response){
 
                    if(status == "success"){
 
                        data = response.responseText;
 
                        //Append to make it part of DOM
                        $('body').append(data);
 
                        //Process Templates
                        Handlebars.Templates.process();
 
                        //Final callback
                        if(args.callback){
                            args.callback();
                        }
 
 
                    }
                })
                .error(function(response){
                    alert("Failed to load templates @ " + args.path);
                });
        }
    }

    /* load all templates for the app */ 
    var args = {
      path: "../apps/templates.hbs",
      sync: true
    }
    Handlebars.Loader.load(args);

})(window.Handlebars, jQuery);

_.extend(App, {

  lineCapacity: new ReactiveVar(5),

  isBlankKeyword: function(value) {

    return (!value ||
            _.isEmpty(value) ||
            (Array.isArray(value) && value.length === 0) ||
            ((value instanceof Spacebars.kw) && _.isEmpty(value.hash)));

  },

  defaultAppLimit: new ReactiveVar(18),

  spkUploader: new Slingshot.Upload('spkUploader'),

  imageUploader: new Slingshot.Upload('imageUploader'),

  parentTemplate: function(tmp, name) {

    var inst;

    if (tmp instanceof Blaze.TemplateInstance) tmp = tmp.view.parentView;
    if (! (tmp instanceof Blaze.View)) throw new Meteor.Error('First argument must be Template instance of View');

    while (true) {

      inst = tmp.templateInstance && tmp.templateInstance();
      if (inst instanceof Blaze.TemplateInstance && (!name || tmp.name === ('Template.' + name))) return inst;
      else if (!tmp.parentView) return null;
      else tmp = tmp.parentView;

    }

  }

});

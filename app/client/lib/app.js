_.extend(App, {

  lineCapacity: new ReactiveVar(5),

  isBlankKeyword: function(value) {

    return (!value ||
            _.isEmpty(value) ||
            (Array.isArray(value) && value.length === 0) ||
            ((value instanceof Spacebars.kw) && _.isEmpty(value.hash)));

  },

  spkUploader: new Slingshot.Upload('spkUploader'),

  imageUploader: new Slingshot.Upload('imageUploader')

});

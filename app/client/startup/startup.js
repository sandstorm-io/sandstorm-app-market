Meteor.startup(function() {
  
  $.ajax({
    method: 'GET',
    url: Meteor.settings && Meteor.settings.public && Meteor.settings.public.API,
    cache: false,
    dataType: 'json',
    success: function(data) {
      _.forEach(data, function(app) {
        Apps.insert(app);
      });
    },
    error: function(err, desc) {
      return AntiModals.overlay('errorModal', {data: {err: desc}});  
    }
  });
  
});
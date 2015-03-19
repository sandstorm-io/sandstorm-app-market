Template.appItem.helpers({

  free: function(price) {

    return price === 0;

  },

  appRating: function(stars) {

    return _.reduce(_.range(5), function(html, ind) {
      return html + '<i class="icon star fa fa-star"></i>';
    }, '');

  }

});

Template.appItem.helpers({

  free: function(price) {

    return price === 0;

  },

  appRating: function(stars) {

    return _.reduce(_.range(5), function(html, ind) {
      if (stars >= ind + 1) html += '<i class="icon star fa fa-star"></i>';
      else if (stars >= ind + 0.5) html += '<i class="icon star fa fa-star-half-o"></i>';
      else html += '<i class="icon star fa fa-star-o"></i>';
      return html;
    }, '');

  }

});

Template.appItem.helpers({

  free: function(price) {

    return price === 0;

  },

  appRating: function(stars) {

    return _.reduce(_.range(5), function(html, ind) {
      if (stars >= ind + 0.5) html += '<i class="icon-star dark"></i>';
      else html += '<i class="icon-star light"></i>';
      return html;
    }, '');

  }

});

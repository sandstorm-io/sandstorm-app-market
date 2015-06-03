Template.appRating.helpers({

  rating: function() {

    if (_.isNumber(this.total)) {
      return 100 * this.positive / this.total;
    }
    else return this.rating;

  }

});

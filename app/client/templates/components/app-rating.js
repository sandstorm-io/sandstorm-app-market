Template.appRating.helpers({

  percentage: function() {

    var num = this.ratings.jobDone + this.ratings.amazing,
        denom = this.ratings.broken + this.ratings.didntLike +
                this.ratings.jobDone + this.ratings.amazing;

    return denom ? (num * 100 / denom) : 50;
  }

});

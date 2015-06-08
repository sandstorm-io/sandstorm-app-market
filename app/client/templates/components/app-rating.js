Template.appRating.helpers({

  percentage: function() {

    var denom = this.ratings.broken + this.ratings.didntLike +
                this.ratings.jobDone + this.ratings.amazing;

    return denom ? {
      broken: this.ratings.broken * 100 / denom,
      didntLike: this.ratings.didntLike * 100 / denom,
      jobDone: this.ratings.jobDone * 100 / denom,
      amazing: this.ratings.amazing * 100 / denom,
      positive: (this.ratings.jobDone + this.ratings.amazing) * 100 / denom
    } : {};
  }

});

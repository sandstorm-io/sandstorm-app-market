App = {

  versionOlder: function(version, comparator) {
    return version.dateTime > comparator.dateTime;
  },

  populatedGenres: new ReactiveVar([])

};

function isPositiveInteger(x) {
  return /^\d+$/.test(x);
}

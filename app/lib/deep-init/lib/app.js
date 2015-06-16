App = {

  versionOlder: function(version, comparator) {
    return version.dateTime > comparator.dateTime;
  }

};

function isPositiveInteger(x) {
  return /^\d+$/.test(x);
}

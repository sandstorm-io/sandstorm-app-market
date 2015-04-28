App = {

  versionOlder: function(version, comparator) {
    if (!version || !comparator) return false;

    var v1parts = comparator.split('.');
    var v2parts = version.split('.');

    // First, validate both numbers are true version numbers
    function validateParts(parts) {
        for (var i = 0; i < parts.length; ++i) {
            if (!isPositiveInteger(parts[i])) {
                return false;
            }
        }
        return true;
    }
    if (!validateParts(v1parts) || !validateParts(v2parts)) {
        return false;
    }

    for (var i = 0; i < v1parts.length; ++i) {
        if (v2parts.length === i) {
            return true;
        }

        if (v1parts[i] === v2parts[i]) {
            continue;
        }
        if (v1parts[i] > v2parts[i]) {
            return true;
        }
        return false;
    }

    if (v1parts.length !== v2parts.length) {
        return false;
    }

    return 0;

  }

};

function isPositiveInteger(x) {
  return /^\d+$/.test(x);
}

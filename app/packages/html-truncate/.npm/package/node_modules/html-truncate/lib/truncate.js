/**
 * Truncate HTML string and keep tag safe.
 *
 * @method truncate
 * @param {String} string string needs to be truncated
 * @param {Number} maxLength length of truncated string
 * @param {Object} options (optional)
 * @param {Boolean} [options.keepImageTag] flag to specify if keep image tag, false by default
 * @param {Boolean} [options.truncateLastWord] truncates last word, true by default
 * @param {Number} [options.slop] tolerance when options.truncateLastWord is false before we give up and just truncate at the maxLength position, 10 by default (but not greater than maxLength)
 * @param {Boolean|String} [options.ellipsis] omission symbol for truncated string, '...' by default
 * @return {String} truncated string
 */
function truncate(string, maxLength, options) {
    var EMPTY_OBJECT = {},
        EMPTY_STRING = '',
        DEFAULT_TRUNCATE_SYMBOL = '...',
        DEFAULT_SLOP = 10 > maxLength ? maxLength : 10,
        EXCLUDE_TAGS = ['img'],         // non-closed tags
        items = [],                     // stack for saving tags
        total = 0,                      // record how many characters we traced so far
        content = EMPTY_STRING,         // truncated text storage
        KEY_VALUE_REGEX = '([\\w|-]+\\s*=\\s*"[^"]*"\\s*)*',
        IS_CLOSE_REGEX = '\\s*\\/?\\s*',
        CLOSE_REGEX = '\\s*\\/\\s*',
        SELF_CLOSE_REGEX = new RegExp('<\\/?\\w+\\s*' + KEY_VALUE_REGEX + CLOSE_REGEX + '>'),
        HTML_TAG_REGEX = new RegExp('<\\/?\\w+\\s*' + KEY_VALUE_REGEX + IS_CLOSE_REGEX + '>'),
        URL_REGEX = /(((ftp|https?):\/\/)[\-\w@:%_\+.~#?,&\/\/=]+)|((mailto:)?[_.\w\-]+@([\w][\w\-]+\.)+[a-zA-Z]{2,3})/g, // Simple regexp
        IMAGE_TAG_REGEX = new RegExp('<img\\s*' + KEY_VALUE_REGEX + IS_CLOSE_REGEX + '>'),
        WORD_BREAK_REGEX = new RegExp('\\W+', 'g'),
        matches = true,
        result,
        index,
        tail,
        tag,
        selfClose;

    /**
     * Remove image tag
     *
     * @private
     * @method _removeImageTag
     * @param {String} string not-yet-processed string
     * @return {String} string without image tags
     */
    function _removeImageTag(string) {
        var match = IMAGE_TAG_REGEX.exec(string),
            index,
            len;

        if (!match) {
            return string;
        }

        index = match.index;
        len = match[0].length;

        return string.substring(0, index) + string.substring(index + len);
    }

    /**
     * Dump all close tags and append to truncated content while reaching upperbound
     *
     * @private
     * @method _dumpCloseTag
     * @param {String[]} tags a list of tags which should be closed
     * @return {String} well-formatted html
     */
    function _dumpCloseTag(tags) {
        var html = '';

        tags.reverse().forEach(function (tag, index) {
            // dump non-excluded tags only
            if (-1 === EXCLUDE_TAGS.indexOf(tag)) {
                html += '</' + tag + '>';
            }
        });

        return html;
    }

    /**
     * Process tag string to get pure tag name
     *
     * @private
     * @method _getTag
     * @param {String} string original html
     * @return {String} tag name
     */
    function _getTag(string) {
        var tail = string.indexOf(' ');

        // TODO:
        // we have to figure out how to handle non-well-formatted HTML case
        if (-1 === tail) {
            tail = string.indexOf('>');
            if (-1 === tail) {
                throw new Error('HTML tag is not well-formed : ' + string);
            }
        }

        return string.substring(1, tail);
    }


    /**
     * Get the end position for String#substring()
     *
     * If options.truncateLastWord is FALSE, we try to the end position up to
     * options.slop characters to avoid breaking in the middle of a word.
     *
     * @private
     * @method _getEndPosition
     * @param {String} string original html
     * @param {Number} tailPos (optional) provided to avoid extending the slop into trailing HTML tag
     * @return {Number} maxLength
     */
    function _getEndPosition (string, tailPos) {
        var defaultPos = maxLength - total,
            position = defaultPos,
            isShort = defaultPos < options.slop,
            slopPos = isShort ? defaultPos : options.slop - 1,
            substr,
            startSlice = isShort ? 0 : defaultPos - options.slop,
            endSlice = tailPos || (defaultPos + options.slop),
            result;

        if (!options.truncateLastWord) {

            substr = string.slice(startSlice, endSlice);

            if (tailPos && substr.length <= tailPos) {
                position = substr.length;
            }
            else {
                while ((result = WORD_BREAK_REGEX.exec(substr)) !== null) {
                    // a natural break position before the hard break position
                    if (result.index < slopPos) {
                        position = defaultPos - (slopPos - result.index);
                        // keep seeking closer to the hard break position
                        // unless a natural break is at position 0
                        if (result.index === 0 && defaultPos <= 1) break;
                    }
                    // a natural break position exactly at the hard break position
                    else if (result.index === slopPos) {
                        position = defaultPos;
                        break; // seek no more
                    }
                    // a natural break position after the hard break position
                    else {
                        position = defaultPos + (result.index - slopPos);
                        break;  // seek no more
                    }
                }
            }
            if (string.charAt(position - 1).match(/\s$/)) position--;
        }
        return position;
    }

    options = options || EMPTY_OBJECT;
    options.ellipsis = (undefined !== options.ellipsis) ? options.ellipsis : DEFAULT_TRUNCATE_SYMBOL;
    options.truncateLastWord = (undefined !== options.truncateLastWord) ? options.truncateLastWord : true;
    options.slop = (undefined !== options.slop) ? options.slop : DEFAULT_SLOP;

    while (matches) {
        matches = HTML_TAG_REGEX.exec(string);

        if (!matches) {
            if (total >= maxLength) { break; }

            matches = URL_REGEX.exec(string);
            if (!matches || matches.index >= maxLength) {
                content += string.substring(0, _getEndPosition(string));
                break;
            }

            while (matches) {
                result = matches[0];
                index = matches.index;
                content += string.substring(0, (index + result.length) - total);
                string = string.substring(index + result.length);
                matches = URL_REGEX.exec(string);
            }
            break;
        }

        result = matches[0];
        index = matches.index;

        if (total + index > maxLength) {
            // exceed given `maxLength`, dump everything to clear stack
            content += string.substring(0, _getEndPosition(string, index));
            break;
        } else {
            total += index;
            content += string.substring(0, index);
        }

        if ('/' === result[1]) {
            // move out open tag
            items.pop();
            selfClose=null;
        } else {
            selfClose = SELF_CLOSE_REGEX.exec(result);
            if (!selfClose) {
                tag = _getTag(result);

                items.push(tag);
            }
        }

        if (selfClose) {
            content += selfClose[0];
        } else {
            content += result;
        }
        string = string.substring(index + result.length);
    }

    if (string.length > maxLength - total && options.ellipsis) {
        content += options.ellipsis;
    }
    content += _dumpCloseTag(items);

    if (!options.keepImageTag) {
        content = _removeImageTag(content);
    }

    return content;
}

module.exports = truncate;

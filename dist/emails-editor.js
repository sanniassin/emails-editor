(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = global || self, global.EmailsEditor = factory());
}(this, function () { 'use strict';

  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }

    return obj;
  }

  var EMAIL_REGEXP = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;
  function validateEmail(email) {
    return EMAIL_REGEXP.test(email);
  }
  function nodeListToArray(nodeList) {
    return Array.prototype.slice.call(nodeList);
  }
  function escapeHtml(string) {
    return ("" + string).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/'/g, "&#x27;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
  function isTextNode(node) {
    return node.nodeType === 3;
  }

  var ENTER_KEY = 13;
  var BACKSPACE_KEY = 8;
  var SEPARATOR = '<br class="emails-editor-separator" />';

  function isEmailSeparator(node) {
    return !isTextNode(node) && node.className === "emails-editor-separator";
  }

  var EmailsEditor = function EmailsEditor(element, _temp) {
    var _this = this;

    var _ref = _temp === void 0 ? {} : _temp,
        _ref$className = _ref.className,
        className = _ref$className === void 0 ? "" : _ref$className,
        _ref$emails = _ref.emails,
        _emails = _ref$emails === void 0 ? [] : _ref$emails;

    _defineProperty(this, "adjustSelection", function () {
      if (!_this.isFocused) {
        return;
      }

      var _window$getSelection = window.getSelection(),
          anchorNode = _window$getSelection.anchorNode;

      if (anchorNode && anchorNode !== _this.input && _this.input.contains(anchorNode)) {
        var selectedNode = isTextNode(anchorNode) ? anchorNode.parentElement : anchorNode;

        if (selectedNode.className === "emails-editor-separator") {
          var cursorPosition = nodeListToArray(_this.input.childNodes).indexOf(selectedNode); // this.setCursorPosition(cursorPosition);
        }
      }

      requestAnimationFrame(_this.adjustSelection);
    });

    _defineProperty(this, "getSelection", function () {
      var childNodes = nodeListToArray(_this.input.childNodes);
      var selection = window.getSelection();
      var anchorNode = selection.anchorNode,
          anchorOffset = selection.anchorOffset,
          focusNode = selection.focusNode,
          focusOffset = selection.focusOffset;

      if (!_this.input.contains(anchorNode)) {
        return {
          start: null,
          end: null
        };
      }

      if (anchorNode !== _this.input) {
        while (childNodes.indexOf(anchorNode) === -1) {
          anchorNode = anchorNode.parentNode;
        }

        anchorOffset = childNodes.indexOf(anchorNode);
      }

      if (focusNode !== _this.input) {
        while (childNodes.indexOf(focusNode) === -1) {
          focusNode = focusNode.parentNode;
        }

        focusOffset = childNodes.indexOf(focusNode);
      }

      var start = Math.min(anchorOffset, focusOffset);
      var end = Math.max(anchorOffset, focusOffset);
      start = childNodes.slice(0, start).filter(function (node) {
        return !isEmailSeparator(node);
      }).length;
      end = childNodes.slice(0, end).filter(function (node) {
        return !isEmailSeparator(node);
      }).length;
      return {
        start: start,
        end: end
      };
    });

    _defineProperty(this, "setCursorAtEmailIndex", function (index) {
      var range = document.createRange();
      var selection = window.getSelection();
      var childNodes = nodeListToArray(_this.input.childNodes);
      var emailBlocks = nodeListToArray(_this.input.querySelectorAll(".emails-editor__email"));
      var emailBlock = emailBlocks[index];
      var position = emailBlock ? childNodes.indexOf(emailBlock) : childNodes.length - 1;
      range.setStart(_this.input, position);
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);
    });

    _defineProperty(this, "parseEmails", function () {
      var childNodes = nodeListToArray(_this.input.childNodes);
      var emails = childNodes.reduce(function (result, node) {
        var emails = (isTextNode(node) ? node.textContent : node.innerText).replace(/[\s,]+/, " ").split(" ").filter(function (email) {
          return !!email.trim();
        });
        return result.concat(emails);
      }, []);
      return emails;
    });

    _defineProperty(this, "format", function () {
      _this.emails = _this.parseEmails();
      var childNodes = nodeListToArray(_this.input.childNodes);

      function getEmailBlock(email) {
        var isValid = validateEmail(email);
        var classNames = ["emails-editor__email", isValid ? "emails-editor__email--valid" : "emails-editor__email--invalid"].join(" ");
        return "<span contenteditable=\"false\" class=\"" + classNames + "\">" + escapeHtml(email) + "<span class=\"emails-editor__email-btn-remove\"></span></span>";
      }

      var lastEditedIndex = _this.getSelection().start;

      childNodes.reduce(function (result, node, index) {
        var emails = (isTextNode(node) ? node.textContent : node.innerText).replace(/[\s,]+/, " ").split(" ").filter(function (email) {
          return !!email.trim();
        });

        if (isTextNode(node)) {
          lastEditedIndex = result.length + emails.length - 1;
        }

        return result.concat(emails);
      }, []);

      var html = _this.emails.map(getEmailBlock).join(SEPARATOR);

      _this.input.innerHTML = html ? SEPARATOR + html + SEPARATOR : SEPARATOR;
      var removeButtons = nodeListToArray(_this.input.querySelectorAll(".emails-editor__email-btn-remove"));
      removeButtons.forEach(function (removeButton) {
        removeButton.addEventListener("click", _this.onEmailRemoveClick);
      });

      if (_this.isFocused && lastEditedIndex !== null) {
        _this.setCursorAtEmailIndex(lastEditedIndex + 1);
      }
    });

    _defineProperty(this, "formatIfNeeded", function () {
      var text = nodeListToArray(_this.input.childNodes).filter(function (node) {
        return isTextNode(node) || node.className !== "emails-editor-separator";
      }).map(function (node) {
        return isTextNode(node) ? node.textContent : node.innerText;
      }).join("");

      if (/[\s,]/.test(text)) {
        _this.format();
      }
    });

    _defineProperty(this, "onEmailRemoveClick", function (event) {
      var cursorPosition = _this.getSelection().start;

      var emailBlock = event.target.parentElement;

      _this.input.removeChild(emailBlock);

      _this.emails = _this.parseEmails();

      _this.format();

      if (cursorPosition) {
        _this.setCursorAtEmailIndex(cursorPosition);
      }
    });

    _defineProperty(this, "onFocus", function () {
      _this.isFocused = true;

      _this.adjustSelection();
    });

    _defineProperty(this, "onBlur", function () {
      _this.isFocused = false;

      _this.format();
    });

    _defineProperty(this, "onKeyDown", function (event) {
      if (event.keyCode === ENTER_KEY) {
        event.preventDefault();

        _this.format();
      } else if (event.keyCode === BACKSPACE_KEY) {
        event.preventDefault();

        var selection = _this.getSelection();

        var isSelectionCompact = selection.start === selection.end;
        var emails = isSelectionCompact ? [].concat(_this.emails.slice(0, selection.start).slice(0, -1), _this.emails.slice(selection.end)) : [].concat(_this.emails.slice(0, selection.start), _this.emails.slice(selection.end));
        _this.input.innerText = emails.join(" ");

        _this.format();

        _this.setCursorAtEmailIndex(isSelectionCompact ? selection.start : selection.start);
      }
    });

    _defineProperty(this, "onPaste", function (event) {
      event.preventDefault();
      var text = event.clipboardData.getData("text");

      var _this$getSelection = _this.getSelection(),
          start = _this$getSelection.start,
          end = _this$getSelection.end;

      _this.input.innerHTML = _this.input.innerHTML.slice(0, start) + escapeHtml(text) + _this.input.innerHTML.slice(end);
      _this.emails = _this.parseEmails();

      _this.formatIfNeeded();
    });

    _defineProperty(this, "onInput", function () {
      _this.emails = _this.parseEmails();

      _this.formatIfNeeded();
    });

    var input = document.createElement("div");
    input.className = ["emails-editor", className].join(" ");
    input.innerText = _emails.join(" ");
    input.contentEditable = true;
    input.addEventListener("input", this.onInput);
    input.addEventListener("paste", this.onPaste);
    input.addEventListener("click", this.onClick);
    input.addEventListener("focus", this.onFocus);
    input.addEventListener("blur", this.onBlur);
    input.addEventListener("keydown", this.onKeyDown);
    this.input = input;
    this.emails = _emails;
    this.format();
    this.isFocused = false;
    element.append(input);
  };

  return EmailsEditor;

}));

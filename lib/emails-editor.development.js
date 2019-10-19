'use strict';

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

function styleInject(css, ref) {
  if (ref === void 0) ref = {};
  var insertAt = ref.insertAt;

  if (!css || typeof document === 'undefined') {
    return;
  }

  var head = document.head || document.getElementsByTagName('head')[0];
  var style = document.createElement('style');
  style.type = 'text/css';

  if (insertAt === 'top') {
    if (head.firstChild) {
      head.insertBefore(style, head.firstChild);
    } else {
      head.appendChild(style);
    }
  } else {
    head.appendChild(style);
  }

  if (style.styleSheet) {
    style.styleSheet.cssText = css;
  } else {
    style.appendChild(document.createTextNode(css));
  }
}

var css = ".emails-editor { background: white; white-space: nowrap; display: -ms-flexbox; display: flex; -ms-flex-wrap: wrap; flex-wrap: wrap; -ms-flex-line-pack: start; align-content: flex-start; font-size: 14px; line-height: 24px; padding: 7px 8px 3px; cursor: text; overflow: hidden; }\n.emails-editor__email { position: relative; margin-right: 6px; max-width: 100%; box-sizing: border-box; margin-bottom: 3px; height: 24px; cursor: default; }\n.emails-editor__email-btn-remove { padding-left: 6px; cursor: pointer; font-weight: 300; }\n.emails-editor__email-btn-remove::after { content: \"×\"; }\n.emails-editor__email--valid { background-color: rgba(102, 152, 255, 0.2); border-radius: 12px; padding-left: 10px; padding-right: 7px; margin-right: 8px; }\n.emails-editor__email--invalid { padding-right: 3px; }\n.emails-editor__email--invalid::after { content: \"\"; display: block; position: absolute; left: 0; right: 3px; bottom: 0; border-bottom: 1px dashed #d14836; }\n.emails-editor__input { -ms-flex-positive: 1; flex-grow: 1; max-width: 100%; font: inherit; height: 24px; margin-bottom: 3px; }\n.emails-editor__width-calculator { white-space: nowrap; font: inherit; position: absolute; visibility: hidden; top: 0; left: 0; }";
styleInject(css);

var EmailsEditor = function EmailsEditor(element, _temp) {
  var _this = this;

  var _ref = _temp === void 0 ? {} : _temp,
      _ref$className = _ref.className,
      _className = _ref$className === void 0 ? "" : _ref$className,
      _ref$placeholder = _ref.placeholder,
      _placeholder = _ref$placeholder === void 0 ? "" : _ref$placeholder,
      _ref$addMorePlacehold = _ref.addMorePlaceholder,
      _addMorePlaceholder = _ref$addMorePlacehold === void 0 ? "" : _ref$addMorePlacehold,
      _ref$emails = _ref.emails,
      _emails = _ref$emails === void 0 ? [] : _ref$emails,
      onChange = _ref.onChange;

  _defineProperty(this, "createEmailBlock", function (email) {
    var escapedEmail = escapeHtml(email);
    var isValid = validateEmail(email);
    var className = ["emails-editor__email", isValid ? "emails-editor__email--valid" : "emails-editor__email--invalid"].join(" ");
    var emailBlock = document.createElement("span");
    emailBlock.className = className;
    emailBlock.innerHTML = escapedEmail + "<span class=\"emails-editor__email-btn-remove\"></span>";
    emailBlock.querySelector(".emails-editor__email-btn-remove").addEventListener("click", function () {
      var emailBlocks = nodeListToArray(_this.container.querySelectorAll(".emails-editor__email"));
      var index = emailBlocks.indexOf(emailBlock);

      _this.removeEmailAtIndex(index);
    });
    return emailBlock;
  });

  _defineProperty(this, "addEmail", function (email) {
    _this.emails = [].concat(_this.emails, [email]);

    var emailBlock = _this.createEmailBlock(email);

    _this.container.insertBefore(emailBlock, _this.input);

    _this.adjustInputPlaceholder();

    _this.adjustInputWidth();

    if (_this.onChange) {
      _this.onChange(_this.getEmails());
    }
  });

  _defineProperty(this, "removeEmailAtIndex", function (index) {
    _this.emails = [].concat(_this.emails.slice(0, index), _this.emails.slice(index + 1));
    var emailBlock = _this.container.children[index];

    _this.container.removeChild(emailBlock);

    _this.adjustInputPlaceholder();

    _this.adjustInputWidth();

    if (_this.onChange) {
      _this.onChange(_this.getEmails());
    }
  });

  _defineProperty(this, "resetEmails", function () {
    while (_this.emails.length) {
      _this.removeEmailAtIndex(_this.emails.length - 1);
    }
  });

  _defineProperty(this, "getEmails", function () {
    return _this.emails.map(function (email) {
      return {
        value: email,
        valid: validateEmail(email)
      };
    });
  });

  _defineProperty(this, "setEmails", function (emails) {
    _this.resetEmails();

    emails.forEach(_this.addEmail);
  });

  _defineProperty(this, "adjustInputPlaceholder", function () {
    var placeholder = _this.placeholder,
        addMorePlaceholder = _this.addMorePlaceholder;

    if (!_this.emails.length) {
      _this.input.placeholder = placeholder;
    } else {
      _this.input.placeholder = addMorePlaceholder;
    }
  });

  _defineProperty(this, "adjustInputWidth", function () {
    var _this$input = _this.input,
        placeholder = _this$input.placeholder,
        value = _this$input.value;
    _this.widthCalculator.innerText = value;

    var valueWidth = _this.widthCalculator.getBoundingClientRect().width;

    _this.widthCalculator.innerText = placeholder;

    var placeholderWidth = _this.widthCalculator.getBoundingClientRect().width;

    var inputWidth = Math.max(valueWidth, placeholderWidth);
    _this.input.style.width = inputWidth + "px";
  });

  _defineProperty(this, "onKeyDown", function (event) {
    if (event.key === "Enter") {
      var email = _this.input.value.trim();

      if (email) {
        _this.addEmail(_this.input.value);

        _this.input.value = "";

        _this.adjustInputWidth();
      }
    } else if (event.key === "Backspace") {
      var isInputEditing = _this.input.selectionEnd > 0;
      var hasEmails = _this.emails.length > 0;

      if (isInputEditing || !hasEmails) {
        return;
      }

      _this.removeEmailAtIndex(_this.emails.length - 1);
    }
  });

  _defineProperty(this, "onInput", function () {
    var hasSeparator = /[\s,]/.test(_this.input.value);

    if (hasSeparator) {
      var emails = _this.input.value.replace(/[\s,]+/, " ").trim().split(" ").filter(function (email) {
        return !!email.trim();
      });

      emails.forEach(_this.addEmail);
      _this.input.value = "";
    }

    _this.adjustInputWidth();
  });

  _defineProperty(this, "onBlur", function () {
    var email = _this.input.value.trim();

    if (email) {
      _this.addEmail(_this.input.value);

      _this.input.value = "";

      _this.adjustInputWidth();
    }
  });

  _defineProperty(this, "onContainerClick", function () {
    _this.input.focus();
  });

  var input = document.createElement("input");
  input.className = "emails-editor__input"; // We use inputMode instead of type because selectionStart/selectionStart
  // properties aren't supported for type="email".
  // See https://html.spec.whatwg.org/multipage/input.html#do-not-apply

  input.inputMode = "email";
  input.addEventListener("input", this.onInput);
  input.addEventListener("keydown", this.onKeyDown);
  input.addEventListener("blur", this.onBlur);
  var widthCalculator = document.createElement("div");
  widthCalculator.className = "emails-editor__width-calculator";
  var container = document.createElement("div");
  container.className = "emails-editor " + _className;
  container.appendChild(input);
  container.appendChild(widthCalculator);
  container.addEventListener("click", this.onContainerClick);
  this.input = input;
  this.widthCalculator = widthCalculator;
  this.container = container;
  this.emails = [];
  this.placeholder = _placeholder;
  this.addMorePlaceholder = _addMorePlaceholder;
  this.onChange = onChange;
  this.adjustInputPlaceholder();

  _emails.forEach(this.addEmail);

  element.appendChild(container);
};

module.exports = EmailsEditor;

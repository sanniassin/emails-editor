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

  var css = ".emails-editor { background: white; white-space: nowrap; display: flex; flex-wrap: wrap; align-content: flex-start; font-size: 14px; line-height: 24px; padding: 7px 8px 3px; cursor: text; overflow: hidden; }\n.emails-editor__email { position: relative; margin-right: 6px; max-width: 100%; box-sizing: border-box; margin-bottom: 3px; height: 24px; cursor: default; }\n.emails-editor__email-btn-remove { padding-left: 6px; cursor: pointer; font-weight: 300; }\n.emails-editor__email-btn-remove::after { content: \"×\"; }\n.emails-editor__email--valid { background-color: rgba(102, 152, 255, 0.2); border-radius: 12px; padding-left: 10px; padding-right: 7px; margin-right: 8px; }\n.emails-editor__email--invalid { padding-right: 3px; }\n.emails-editor__email--invalid::after { content: \"\"; display: block; position: absolute; left: 0; right: 3px; bottom: 0; border-bottom: 1px dashed #d14836; }\n.emails-editor__input { flex-grow: 1; max-width: 100%; font: inherit; height: 24px; border: 0; padding: 0; margin: 0 0 3px; box-shadow: none; outline: none; }\n.emails-editor__input::-ms-clear {  display: none; } \n.emails-editor__width-calculator { white-space: nowrap; font: inherit; position: absolute; visibility: hidden; top: 0; left: 0; }";
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
      var isValid = validateEmail(email);
      var classNames = ["emails-editor__email", isValid ? "emails-editor__email--valid" : "emails-editor__email--invalid"];
      var className = classNames.join(" ");
      var emailBlock = document.createElement("span");
      emailBlock.className = className;
      emailBlock.innerText = email;
      var removeButton = document.createElement("span");
      removeButton.className = "emails-editor__email-btn-remove";
      removeButton.addEventListener("click", function () {
        var index = _this.emailBlocks.indexOf(emailBlock);

        _this.removeEmailAtIndex(index);
      });
      emailBlock.appendChild(removeButton);
      return emailBlock;
    });

    _defineProperty(this, "addEmail", function (email) {
      var emails = Array.isArray(email) ? email : [email];
      emails.forEach(function (email) {
        var emailBlock = _this.createEmailBlock(email);

        _this.container.insertBefore(emailBlock, _this.input);

        _this.emails.push(email);

        _this.emailBlocks.push(emailBlock);
      });

      _this.adjustInputPlaceholder();

      _this.adjustInputWidth();

      if (_this.onChange) {
        _this.onChange(_this.getEmails());
      }
    });

    _defineProperty(this, "addEnteredEmail", function () {
      var emails = _this.input.value.replace(/[\s,]+/g, " ").trim().split(" ").filter(function (email) {
        return !!email.trim();
      });

      if (emails.length) {
        _this.input.value = "";

        _this.addEmail(emails);
      }
    });

    _defineProperty(this, "removeEmailAtIndex", function (index) {
      var emailBlock = _this.container.children[index];

      _this.container.removeChild(emailBlock);

      _this.emails.splice(index, 1);

      _this.emailBlocks.splice(index, 1);

      _this.adjustInputPlaceholder();

      _this.adjustInputWidth();

      if (_this.onChange) {
        _this.onChange(_this.getEmails());
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
      // Remove existing emails
      _this.emailBlocks.forEach(function (emailBlock) {
        _this.container.removeChild(emailBlock);
      });

      _this.emailBlocks = [];
      _this.emails = [];

      _this.addEmail(emails);
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
        _this.addEnteredEmail();
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
        _this.addEnteredEmail();
      } else {
        _this.adjustInputWidth();
      }
    });

    _defineProperty(this, "onBlur", function () {
      _this.addEnteredEmail();
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
    this.emailBlocks = [];
    this.placeholder = _placeholder;
    this.addMorePlaceholder = _addMorePlaceholder;
    this.onChange = onChange;
    this.addEmail(_emails);
    this.adjustInputPlaceholder();
    element.appendChild(container);
  };

  return EmailsEditor;

}));

// import "core-js/es/array/find-index";
// import "core-js/es/array/includes";
// import "core-js/es/string/includes";

import {
  isTextNode,
  escapeHtml,
  nodeListToArray,
  validateEmail
} from "./utils";

const SEPARATOR =
  '<span data-email-separator class="emails-editor__separator">&#8203;</span>';

function isEmailSeparator(node) {
  return !isTextNode(node) && node.hasAttribute("data-email-separator");
}

function isEmailBlock(node) {
  return !isTextNode(node) && node.hasAttribute("data-email");
}

function getNodeEmails(node) {
  return (isTextNode(node) ? node.textContent : node.innerText)
    .replace(/[\s,]+/, " ")
    .split(" ")
    .filter(email => !!email.trim());
}

function getEmailBlockMarkup(email) {
  const isValid = validateEmail(email);
  const escapedEmail = escapeHtml(email);
  const classNames = [
    "emails-editor__email",
    isValid ? "emails-editor__email--valid" : "emails-editor__email--invalid"
  ].join(" ");
  return `<span data-email contenteditable="false" class="${classNames}">${escapedEmail}<span class="emails-editor__email-btn-remove"></span></span>`;
}

class EmailsEditor {
  constructor(element, { className = "", emails = [] } = {}) {
    const input = document.createElement("div");
    input.className = ["emails-editor", className].join(" ");
    input.innerText = emails.join(" ");
    input.contentEditable = true;
    input.inputMode = "email";
    input.addEventListener("input", this.onInput);
    input.addEventListener("paste", this.onPaste);
    input.addEventListener("mousedown", this.onMouseDown);
    input.addEventListener("focus", this.onFocus);
    input.addEventListener("blur", this.onBlur);
    input.addEventListener("keydown", this.onKeyDown);

    this.input = input;
    this.emails = emails;
    this.format();
    this.isFocused = false;

    element.append(input);
  }

  adjustSelection = () => {
    if (!this.isFocused) {
      return;
    }

    const { anchorNode } = window.getSelection();
    if (
      anchorNode &&
      anchorNode !== this.input &&
      this.input.contains(anchorNode)
    ) {
      const selectedNode = isTextNode(anchorNode)
        ? anchorNode.parentElement
        : anchorNode;

      if (isEmailSeparator(selectedNode)) {
        const cursorPosition = this.getSelection().start;
        // this.setCursorAtEmailIndex(cursorPosition);
      }
    }
    requestAnimationFrame(this.adjustSelection);
  };

  getSelection = () => {
    const childNodes = nodeListToArray(this.input.childNodes);
    const selection = window.getSelection();
    let { anchorNode, anchorOffset, focusNode, focusOffset } = selection;
    if (!this.input.contains(anchorNode)) {
      return { start: null, end: null };
    }

    if (anchorNode !== this.input) {
      while (childNodes.indexOf(anchorNode) === -1) {
        anchorNode = anchorNode.parentNode;
      }
      anchorOffset = childNodes.indexOf(anchorNode);
    }

    if (focusNode !== this.input) {
      while (childNodes.indexOf(focusNode) === -1) {
        focusNode = focusNode.parentNode;
      }
      focusOffset = childNodes.indexOf(focusNode);
    }

    let start = Math.min(anchorOffset, focusOffset);
    let end = Math.max(anchorOffset, focusOffset);

    start = childNodes.slice(0, start).filter(isEmailBlock).length;
    end = childNodes.slice(0, end).filter(isEmailBlock).length;

    return { start, end };
  };

  setCursorAtEmailIndex = index => {
    const range = document.createRange();
    const selection = window.getSelection();
    const childNodes = nodeListToArray(this.input.childNodes);
    const emailBlocks = nodeListToArray(
      this.input.querySelectorAll(".emails-editor__email")
    );
    const emailBlock = emailBlocks[index];
    const position = emailBlock
      ? childNodes.indexOf(emailBlock)
      : childNodes.length - 1;
    range.setStart(this.input, position);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
  };

  parseEmails = () => {
    const childNodes = nodeListToArray(this.input.childNodes);
    const emails = childNodes.reduce((result, node) => {
      const emails = getNodeEmails(node);
      return result.concat(emails);
    }, []);

    return emails;
  };

  format = () => {
    this.emails = this.parseEmails();

    const childNodes = nodeListToArray(this.input.childNodes);

    const selection = this.getSelection();
    let lastEditedIndex = null;
    childNodes.reduce((result, node) => {
      const emails = getNodeEmails(node);
      if (isTextNode(node)) {
        lastEditedIndex = result.length + emails.length - 1;
      }
      return result.concat(emails);
    }, []);

    const html = this.emails.map(getEmailBlockMarkup).join(SEPARATOR);
    this.input.innerHTML = html ? SEPARATOR + html + SEPARATOR : SEPARATOR;

    const removeButtons = nodeListToArray(
      this.input.querySelectorAll(".emails-editor__email-btn-remove")
    );
    removeButtons.forEach(removeButton => {
      removeButton.addEventListener("click", this.onEmailRemoveClick);
    });

    if (this.isFocused) {
      this.setCursorAtEmailIndex(
        lastEditedIndex !== null ? lastEditedIndex + 1 : selection.start
      );
    }
  };

  formatIfNeeded = () => {
    const childNodes = nodeListToArray(this.input.childNodes);
    const text = childNodes
      .filter(node => {
        return isTextNode(node) || isEmailBlock(node);
      })
      .map(node => {
        return isTextNode(node) ? node.textContent : node.innerText;
      })
      .join("");
    const hasDoubleNewlines = !!this.input.querySelector("br + br");
    if (/[\s,]/.test(text) || hasDoubleNewlines) {
      this.format();
    }
  };

  onEmailRemoveClick = event => {
    const cursorPosition = this.getSelection().start;
    const emailBlock = event.target.parentElement;
    this.input.removeChild(emailBlock);
    this.emails = this.parseEmails();
    this.format();
    if (cursorPosition) {
      this.setCursorAtEmailIndex(cursorPosition);
    }
  };

  onFocus = () => {
    this.isFocused = true;
    this.adjustSelection();
  };

  onBlur = () => {
    this.isFocused = false;
    this.format();
  };

  onKeyDown = event => {
    if (event.key === "Enter") {
      event.preventDefault();
      this.format();
    } else if (event.key === "Backspace") {
      if (isTextNode(window.getSelection().anchorNode)) {
        return;
      }
      event.preventDefault();
      const selection = this.getSelection();
      const isSelectionCompact = selection.start === selection.end;
      const emails = isSelectionCompact
        ? [
            ...this.emails.slice(0, selection.start).slice(0, -1),
            ...this.emails.slice(selection.end)
          ]
        : [
            ...this.emails.slice(0, selection.start),
            ...this.emails.slice(selection.end)
          ];
      this.input.innerText = emails.join(" ");
      this.format();
      this.setCursorAtEmailIndex(
        isSelectionCompact && selection.start
          ? selection.start - 1
          : selection.start
      );
    }
  };

  onPaste = event => {
    event.preventDefault();

    const text = event.clipboardData.getData("text").replace(/\s+/g, " ");
    document.execCommand("insertText", false, text);
  };

  onInput = () => {
    this.emails = this.parseEmails();
    this.formatIfNeeded();
  };

  onMouseDown = event => {
    const childNodes = nodeListToArray(this.input.childNodes);
    const isRemoveButtonClick =
      event.target.className === "emails-editor__email-btn-remove";
    if (event.target === this.input || isRemoveButtonClick) {
      return;
    }

    event.preventDefault();

    let clickedElement = event.target;
    while (childNodes.indexOf(clickedElement) === -1) {
      clickedElement = clickedElement.parentElement;
    }

    const emailBlocks = nodeListToArray(
      this.input.querySelectorAll(".emails-editor__email")
    );
    const emailIndex = emailBlocks.indexOf(clickedElement);
    this.setCursorAtEmailIndex(emailIndex + 1);
  };
}

export default EmailsEditor;

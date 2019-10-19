import { escapeHtml, nodeListToArray, validateEmail } from "./utils";
import "./style.css";

class EmailsEditor {
  constructor(
    element,
    {
      className = "",
      placeholder = "",
      addMorePlaceholder = "",
      emails = [],
      onChange
    } = {}
  ) {
    const input = document.createElement("input");
    input.className = "emails-editor__input";
    // We use inputMode instead of type because selectionStart/selectionStart
    // properties aren't supported for type="email".
    // See https://html.spec.whatwg.org/multipage/input.html#do-not-apply
    input.inputMode = "email";
    input.addEventListener("input", this.onInput);
    input.addEventListener("keydown", this.onKeyDown);
    input.addEventListener("blur", this.onBlur);

    const widthCalculator = document.createElement("div");
    widthCalculator.className = "emails-editor__width-calculator";

    const container = document.createElement("div");
    container.className = `emails-editor ${className}`;
    container.appendChild(input);
    container.appendChild(widthCalculator);
    container.addEventListener("click", this.onContainerClick);

    this.input = input;
    this.widthCalculator = widthCalculator;
    this.container = container;
    this.emails = [];
    this.placeholder = placeholder;
    this.addMorePlaceholder = addMorePlaceholder;
    this.onChange = onChange;

    this.adjustInputPlaceholder();
    emails.forEach(this.addEmail);

    element.appendChild(container);
  }

  createEmailBlock = email => {
    const escapedEmail = escapeHtml(email);
    const isValid = validateEmail(email);
    const className = [
      "emails-editor__email",
      isValid ? "emails-editor__email--valid" : "emails-editor__email--invalid"
    ].join(" ");

    const emailBlock = document.createElement("span");
    emailBlock.className = className;
    emailBlock.innerHTML = `${escapedEmail}<span class="emails-editor__email-btn-remove"></span>`;

    emailBlock
      .querySelector(".emails-editor__email-btn-remove")
      .addEventListener("click", () => {
        const emailBlocks = nodeListToArray(
          this.container.querySelectorAll(".emails-editor__email")
        );
        const index = emailBlocks.indexOf(emailBlock);
        this.removeEmailAtIndex(index);
      });

    return emailBlock;
  };

  addEmail = email => {
    this.emails = [...this.emails, email];
    const emailBlock = this.createEmailBlock(email);
    this.container.insertBefore(emailBlock, this.input);

    this.adjustInputPlaceholder();
    this.adjustInputWidth();

    if (this.onChange) {
      this.onChange(this.getEmails());
    }
  };

  removeEmailAtIndex = index => {
    this.emails = [
      ...this.emails.slice(0, index),
      ...this.emails.slice(index + 1)
    ];
    const emailBlock = this.container.children[index];
    this.container.removeChild(emailBlock);

    this.adjustInputPlaceholder();
    this.adjustInputWidth();

    if (this.onChange) {
      this.onChange(this.getEmails());
    }
  };

  resetEmails = () => {
    while (this.emails.length) {
      this.removeEmailAtIndex(this.emails.length - 1);
    }
  };

  getEmails = () => {
    return this.emails.map(email => ({
      value: email,
      valid: validateEmail(email)
    }));
  };

  setEmails = emails => {
    this.resetEmails();
    emails.forEach(this.addEmail);
  };

  adjustInputPlaceholder = () => {
    const { placeholder, addMorePlaceholder } = this;
    if (!this.emails.length) {
      this.input.placeholder = placeholder;
    } else {
      this.input.placeholder = addMorePlaceholder;
    }
  };

  adjustInputWidth = () => {
    const { placeholder, value } = this.input;

    this.widthCalculator.innerText = value;
    const valueWidth = this.widthCalculator.getBoundingClientRect().width;

    this.widthCalculator.innerText = placeholder;
    const placeholderWidth = this.widthCalculator.getBoundingClientRect().width;

    const inputWidth = Math.max(valueWidth, placeholderWidth);
    this.input.style.width = `${inputWidth}px`;
  };

  onKeyDown = event => {
    if (event.key === "Enter") {
      const email = this.input.value.trim();
      if (email) {
        this.addEmail(this.input.value);
        this.input.value = "";
        this.adjustInputWidth();
      }
    } else if (event.key === "Backspace") {
      const isInputEditing = this.input.selectionEnd > 0;
      const hasEmails = this.emails.length > 0;
      if (isInputEditing || !hasEmails) {
        return;
      }

      this.removeEmailAtIndex(this.emails.length - 1);
    }
  };

  onInput = () => {
    const hasSeparator = /[\s,]/.test(this.input.value);
    if (hasSeparator) {
      const emails = this.input.value
        .replace(/[\s,]+/, " ")
        .trim()
        .split(" ")
        .filter(email => !!email.trim());
      emails.forEach(this.addEmail);
      this.input.value = "";
    }

    this.adjustInputWidth();
  };

  onBlur = () => {
    const email = this.input.value.trim();
    if (email) {
      this.addEmail(this.input.value);
      this.input.value = "";
      this.adjustInputWidth();
    }
  };

  onContainerClick = () => {
    this.input.focus();
  };
}

export default EmailsEditor;

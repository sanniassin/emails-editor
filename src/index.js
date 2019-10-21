import { validateEmail } from "./utils";
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
    this.emailBlocks = [];
    this.placeholder = placeholder;
    this.addMorePlaceholder = addMorePlaceholder;
    this.onChange = onChange;

    this.addEmail(emails);
    this.adjustInputPlaceholder();

    element.appendChild(container);
  }

  createEmailBlock = email => {
    const isValid = validateEmail(email);
    const classNames = [
      "emails-editor__email",
      isValid ? "emails-editor__email--valid" : "emails-editor__email--invalid"
    ];
    const className = classNames.join(" ");

    const emailBlock = document.createElement("span");
    emailBlock.className = className;
    emailBlock.innerText = email;

    const removeButton = document.createElement("span");
    removeButton.className = "emails-editor__email-btn-remove";
    removeButton.addEventListener("click", () => {
      const index = this.emailBlocks.indexOf(emailBlock);
      this.removeEmailAtIndex(index);
    });

    emailBlock.appendChild(removeButton);

    return emailBlock;
  };

  addEmail = email => {
    const emails = Array.isArray(email) ? email : [email];
    emails.forEach(email => {
      const emailBlock = this.createEmailBlock(email);
      this.container.insertBefore(emailBlock, this.input);

      this.emails.push(email);
      this.emailBlocks.push(emailBlock);
    });

    this.adjustInputPlaceholder();
    this.adjustInputWidth();

    if (this.onChange) {
      this.onChange(this.getEmails());
    }
  };

  addEnteredEmail = () => {
    const emails = this.input.value
      .replace(/[\s,]+/g, " ")
      .trim()
      .split(" ")
      .filter(email => !!email.trim());
    
    if (emails.length) {
      this.input.value = "";
      this.addEmail(emails);
    }
  };

  removeEmailAtIndex = index => {
    const emailBlock = this.container.children[index];
    this.container.removeChild(emailBlock);

    this.emails.splice(index, 1);
    this.emailBlocks.splice(index, 1);

    this.adjustInputPlaceholder();
    this.adjustInputWidth();

    if (this.onChange) {
      this.onChange(this.getEmails());
    }
  };

  getEmails = () => {
    return this.emails.map(email => ({
      value: email,
      valid: validateEmail(email)
    }));
  };

  setEmails = emails => {
    // Remove existing emails
    this.emailBlocks.forEach(emailBlock => {
      this.container.removeChild(emailBlock);
    });
    this.emailBlocks = [];
    this.emails = [];

    this.addEmail(emails);
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
      this.addEnteredEmail();
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
      this.addEnteredEmail();
    } else {
      this.adjustInputWidth();
    }
  };

  onBlur = () => {
    this.addEnteredEmail();
  };

  onContainerClick = () => {
    this.input.focus();
  };
}

export default EmailsEditor;

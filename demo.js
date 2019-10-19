import EmailsEditor from "./src";

const editor = new EmailsEditor(
  document.querySelector(".email-form-input-container"),
  {
    className: "email-form-input"
  }
);

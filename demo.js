import EmailsEditor from "./src";

import "./demo.css";

const editor = new EmailsEditor(
  document.querySelector(".email-form__input-container"),
  {
    className: "email-form__input",
    placeholder: "Enter email addresses…",
    addMorePlaceholder: "add more people…",
    onChange: emails => console.log(emails)
  }
);

let addId = 1;
document.querySelector(".btn-add").addEventListener("click", () => {
  editor.addEmail(`email-${addId}@test.com`);
  addId += 1;
});

document.querySelector(".btn-get-count").addEventListener("click", () => {
  const validEmails = editor.getEmails().filter(email => email.valid);
  const message =
    validEmails.length === 1
      ? "There is 1 valid email"
      : `There are ${validEmails.length} valid emails`;
  alert(message);
});

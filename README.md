# Emails Editor

Prototype of a simple email input.

<img src="https://sanniassin.github.io/emails-editor/demo.png" width="321">

#### [Demo](http://sanniassin.github.io/emails-editor/index.html)

# Table of Contents

- [Usage](#usage)
- [Configuration](#configuration)
- [Methods](#methods)

# Usage

```html
<div id="emails-editor"></div>
<script src="dist/emails-editor.js"></script>
<script>
  const editor = new EmailsEditor(
    document.querySelector('#emails-editor'),
    {
      emails: ["oliver@gmail.com"].
      className: "email-form__input",
      placeholder: "Enter email addresses…",
      addMorePlaceholder: "add more people…"
    }
  );

  editor.getEmails(); // returns [{ value: "oliver@gmail.com", valid: true }]
</script>
```

# Configuration
|   Name   | Description |
|  :----:  | :---------: |
|  **emails**  | Initial array of email strings 
|  **className** | Editor's CSS class |
|  **placeholder** | Input placeholder when no emails entered |
|  **addMorePlaceholder** | Input placeholder when at least one email entered |
|  **onChange** | Change event callback. Fires when an email added or removed. Receives an array of emails of the following shape `[{ value: "oliver@gmail.com", valid: true }]`. |

# Methods
|   Name  | Description |
|  :----: | :---------: |
|  **getEmails**  | Returns an array of emails of the following shape `[{ value: "oliver@gmail.com", valid: true }]` |
|  **setEmails**  | Replaces entered emails with the provided array of email strings |

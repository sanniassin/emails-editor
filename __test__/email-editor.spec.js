/* global beforeEach, afterEach, test, page, expect, EmailsEditor */

beforeEach(async () => {
  await page.addScriptTag({
    path: "./dist/emails-editor.js"
  });
});

afterEach(async () => {
  await page.reload();
});

test("adds email on enter press", async () => {
  let emails;

  await page.evaluate(() => {
    window.emailsEditor = new EmailsEditor(document.body, {
      placeholder: "Enter email addresses…",
      addMorePlaceholder: "add more people…"
    });
  });
  await page.click(".emails-editor");

  await page.type(".emails-editor__input", "invalid.email");
  await page.keyboard.press("Enter");
  emails = await page.evaluate(() => window.emailsEditor.getEmails());
  expect(emails).toEqual([{ value: "invalid.email", valid: false }]);

  await page.type(".emails-editor__input", "some@valid.email");
  await page.keyboard.press("Enter");
  emails = await page.evaluate(() => window.emailsEditor.getEmails());
  expect(emails).toEqual([
    { value: "invalid.email", valid: false },
    { value: "some@valid.email", valid: true }
  ]);

  // Shouldn't add email if input is empty
  await page.keyboard.press("Enter");
  emails = await page.evaluate(() => window.emailsEditor.getEmails());
  expect(emails).toEqual([
    { value: "invalid.email", valid: false },
    { value: "some@valid.email", valid: true }
  ]);
});

test("adds email on comma or space type", async () => {
  let emails;

  await page.evaluate(() => {
    window.emailsEditor = new EmailsEditor(document.body);
  });

  await page.click(".emails-editor");
  await page.type(".emails-editor__input", "invalid.email");
  emails = await page.evaluate(() => window.emailsEditor.getEmails());

  expect(emails).toEqual([]);

  // Type space
  await page.type(".emails-editor__input", " ");
  emails = await page.evaluate(() => window.emailsEditor.getEmails());
  expect(emails).toEqual([{ value: "invalid.email", valid: false }]);

  // Paste two space-separated emails
  await page.evaluate(() => {
    document.execCommand(
      "insertText",
      null,
      "some@valid.email another.invalid.email"
    );
  });
  emails = await page.evaluate(() => window.emailsEditor.getEmails());
  expect(emails).toEqual([
    { value: "invalid.email", valid: false },
    { value: "some@valid.email", valid: true },
    { value: "another.invalid.email", valid: false }
  ]);

  // Paste two comma-separated emails
  await page.evaluate(() => {
    document.execCommand(
      "insertText",
      null,
      "some@valid.email,another.invalid.email"
    );
  });
  emails = await page.evaluate(() => window.emailsEditor.getEmails());
  expect(emails).toEqual([
    { value: "invalid.email", valid: false },
    { value: "some@valid.email", valid: true },
    { value: "another.invalid.email", valid: false },
    { value: "some@valid.email", valid: true },
    { value: "another.invalid.email", valid: false }
  ]);
});

test("adds email on blur", async () => {
  await page.evaluate(() => {
    window.emailsEditor = new EmailsEditor(document.body);
  });
  await page.click(".emails-editor");

  await page.type(".emails-editor__input", "invalid.email");
  await page.evaluate(() => {
    document.activeElement.blur();
  });
  const emails = await page.evaluate(() => window.emailsEditor.getEmails());
  expect(emails).toEqual([{ value: "invalid.email", valid: false }]);
});

test("removes email on remove button click", async () => {
  await page.evaluate(() => {
    window.emailsEditor = new EmailsEditor(document.body, {
      emails: ["invalid.email", "some@valid.email", "another.invalid.email"]
    });
  });

  await page.click(
    ".emails-editor__email:nth-child(2) .emails-editor__email-btn-remove"
  );
  const emails = await page.evaluate(() => window.emailsEditor.getEmails());

  expect(emails).toEqual([
    { value: "invalid.email", valid: false },
    { value: "another.invalid.email", valid: false }
  ]);
});

test("removes email on backspace press", async () => {
  await page.evaluate(() => {
    window.emailsEditor = new EmailsEditor(document.body, {
      emails: ["invalid.email", "some@valid.email", "another.invalid.email"]
    });
  });

  await page.click(".emails-editor");
  await page.keyboard.press("Backspace");
  const emails = await page.evaluate(() => window.emailsEditor.getEmails());

  expect(emails).toEqual([
    { value: "invalid.email", valid: false },
    { value: "some@valid.email", valid: true }
  ]);
});
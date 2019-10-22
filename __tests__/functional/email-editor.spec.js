/* eslint-disable no-restricted-syntax, no-await-in-loop */
/* global beforeEach, afterEach, test, page, expect, EmailsEditor */

beforeEach(async () => {
  await page.addScriptTag({
    path: "./dist/emails-editor.js"
  });
});

afterEach(async () => {
  await page.reload();
});

async function assertBlocksMatchEmails(emails) {
  const emailBlocks = await page.$$(".emails-editor__email");
  expect(emailBlocks).toHaveLength(emails.length);
  emailBlocks.forEach(async (emailBlock, i) => {
    const innerText = await emailBlock.evaluate(node => node.innerText);
    expect(innerText).toEqual(emails[i].value);
  });
}

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
  await assertBlocksMatchEmails(emails);

  await page.type(".emails-editor__input", "some@valid.email");
  await page.keyboard.press("Enter");
  emails = await page.evaluate(() => window.emailsEditor.getEmails());
  expect(emails).toEqual([
    { value: "invalid.email", valid: false },
    { value: "some@valid.email", valid: true }
  ]);
  await assertBlocksMatchEmails(emails);

  // Shouldn't add email if input is empty
  await page.keyboard.press("Enter");
  emails = await page.evaluate(() => window.emailsEditor.getEmails());
  expect(emails).toEqual([
    { value: "invalid.email", valid: false },
    { value: "some@valid.email", valid: true }
  ]);
  await assertBlocksMatchEmails(emails);
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
  await assertBlocksMatchEmails(emails);

  // Type space
  await page.type(".emails-editor__input", " ");
  emails = await page.evaluate(() => window.emailsEditor.getEmails());
  expect(emails).toEqual([{ value: "invalid.email", valid: false }]);
  await assertBlocksMatchEmails(emails);

  // Paste two space-separated emails
  await page.evaluate(() => {
    document.execCommand(
      "insertText",
      null,
      "some@valid.email another.invalid.email yet.another.invalid.email"
    );
  });
  emails = await page.evaluate(() => window.emailsEditor.getEmails());
  expect(emails).toEqual([
    { value: "invalid.email", valid: false },
    { value: "some@valid.email", valid: true },
    { value: "another.invalid.email", valid: false },
    { value: "yet.another.invalid.email", valid: false }
  ]);
  await assertBlocksMatchEmails(emails);

  // Paste comma-separated emails
  await page.evaluate(() => {
    document.execCommand(
      "insertText",
      null,
      "some@valid.email,another.invalid.email,yet.another.invalid.email"
    );
  });
  emails = await page.evaluate(() => window.emailsEditor.getEmails());
  expect(emails).toEqual([
    { value: "invalid.email", valid: false },
    { value: "some@valid.email", valid: true },
    { value: "another.invalid.email", valid: false },
    { value: "yet.another.invalid.email", valid: false },
    { value: "some@valid.email", valid: true },
    { value: "another.invalid.email", valid: false },
    { value: "yet.another.invalid.email", valid: false }
  ]);
  await assertBlocksMatchEmails(emails);
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
  await assertBlocksMatchEmails(emails);
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
  await assertBlocksMatchEmails(emails);
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
  await assertBlocksMatchEmails(emails);
});

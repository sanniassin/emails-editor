/* global test, page, expect */

test("adds 1 + 2 to equal 3", async () => {
  await page.addStyleTag({
    path: "./src/style.css"
  });
  await page.addScriptTag({
    path: "./dist/emails-editor.js"
  });
  await page.evaluate(() => {
    window.emailsEditor = new EmailsEditor(document.body);
  });
  await page.focus(".emails-editor");
  await page.type(".emails-editor", "Hello");
  await page.keyboard.press("Enter");
  const emails = await page.evaluate(() => {
    return window.emailsEditor.emails;
  });
  console.log(emails);
  expect(1 + 2).toBe(3);
});

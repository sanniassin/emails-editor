/* global beforeEach, test, expect */
import EmailsEditor from "../../src";

beforeEach(() => {
  document.body.innerHTML = "";
});

test("renders emails from config", () => {
  const editor = new EmailsEditor(document.body, {
    emails: ["some@valid.email", "invalid.email"]
  });

  expect(editor.getEmails()).toEqual([
    { value: "some@valid.email", valid: true },
    { value: "invalid.email", valid: false }
  ]);
});

test("allows to add emails using addEmail", () => {
  const editor = new EmailsEditor(document.body);

  expect(editor.getEmails()).toEqual([]);

  editor.addEmail("some@valid.email");
  expect(editor.getEmails()).toEqual([
    { value: "some@valid.email", valid: true }
  ]);

  editor.addEmail("invalid.email");
  expect(editor.getEmails()).toEqual([
    { value: "some@valid.email", valid: true },
    { value: "invalid.email", valid: false }
  ]);

  editor.addEmail("");
  expect(editor.getEmails()).toEqual([
    { value: "some@valid.email", valid: true },
    { value: "invalid.email", valid: false }
  ]);

  expect(() => {
    editor.addEmail(123);
  }).toThrow();
});

test("allows to set emails using setEmails", () => {
  const editor = new EmailsEditor(document.body);

  expect(editor.getEmails()).toEqual([]);

  editor.addEmail("some@valid.email");
  expect(editor.getEmails()).toEqual([
    { value: "some@valid.email", valid: true }
  ]);

  editor.setEmails(["invalid.email", "another.invalid.email"]);
  expect(editor.getEmails()).toEqual([
    { value: "invalid.email", valid: false },
    { value: "another.invalid.email", valid: false }
  ]);

  editor.setEmails([]);
  expect(editor.getEmails()).toEqual([]);

  expect(() => {
    editor.setEmails(123);
  }).toThrow();

  expect(() => {
    editor.setEmails([123]);
  }).toThrow();
});

test("renders placeholder", () => {
  const placeholder = "Empty placeholder";
  const editor = new EmailsEditor(document.body, { placeholder });

  const input = document.querySelector("input");

  expect(input.placeholder).toBe(placeholder);

  editor.addEmail("some@valid.email");
  expect(input.placeholder).toBe("");
});

test("renders addMorePlaceholder", () => {
  const placeholder = "Empty placeholder";
  const addMorePlaceholder = "add more";
  const editor = new EmailsEditor(document.body, {
    placeholder,
    addMorePlaceholder
  });

  const input = document.querySelector("input");

  expect(input.placeholder).toBe(placeholder);

  editor.addEmail("some@valid.email");
  expect(input.placeholder).toBe(addMorePlaceholder);

  editor.removeEmailAtIndex(0);
  expect(input.placeholder).toBe(placeholder);
});

test("fires change event", () => {
  let fireCount = 0;
  const editor = new EmailsEditor(document.body, {
    emails: ["invalid.email"],
    onChange: emails => {
      fireCount += 1;
      expect(emails).toEqual(editor.getEmails());
    }
  });

  // Should not fire during initialization
  expect(fireCount).toBe(0);

  editor.addEmail("some@valid.email");
  expect(fireCount).toBe(1);

  // Should only fire once regardless of the emails count
  editor.setEmails([
    "invalid.email",
    "some@valid.email",
    "another.invalid.email",
    "yet.another.invalid.email",
    "some@valid.email",
    "another.invalid.email",
    "yet.another.invalid.email"
  ]);
  expect(fireCount).toBe(2);

  editor.removeEmailAtIndex(0);
  expect(fireCount).toBe(3);

  editor.setEmails([]);
  expect(fireCount).toBe(4);

  expect(() => {
    new EmailsEditor(document.body, {
      onChange: "not.a.function"
    });
  }).toThrow();
});

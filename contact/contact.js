import { budgetRanges, contactConfig, coverageOptions, eventTypes } from "../data/contact.mjs";

const form = document.querySelector("[data-enquiry-form]");
const submitButton = form?.querySelector('[type="submit"]');
const formStatus = document.querySelector("[data-form-status]");
const result = document.querySelector("[data-enquiry-result]");
const draftOutput = document.querySelector("[data-enquiry-draft]");
const whatsappLink = document.querySelector("[data-whatsapp-link]");
const emailLink = document.querySelector("[data-email-link]");
let startedAt = Date.now();
let submitting = false;
let lastFingerprint = "";
let lastPreparedAt = 0;

function addOptions(select, values) {
  values.forEach((value) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value;
    select.append(option);
  });
}

function validExternalUrl(value, allowedHosts) {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && allowedHosts.has(url.hostname) ? url : null;
  } catch {
    return null;
  }
}

function renderContactMethods() {
  const methods = [
    { key: "phone", label: "Phone", value: contactConfig.phone, href: contactConfig.phone ? `tel:${contactConfig.phone.replace(/[^+\d]/g, "")}` : null },
    { key: "whatsapp", label: "WhatsApp", value: contactConfig.whatsappNumber, href: contactConfig.whatsappNumber ? `https://wa.me/${contactConfig.whatsappNumber.replace(/\D/g, "")}` : null },
    { key: "email", label: "Email", value: contactConfig.email, href: contactConfig.email ? `mailto:${contactConfig.email}` : null },
    { key: "instagram", label: "Instagram", value: contactConfig.instagramUrl, href: validExternalUrl(contactConfig.instagramUrl, new Set(["instagram.com", "www.instagram.com"]))?.href || null }
  ];
  const container = document.querySelector("[data-contact-methods]");
  const fragment = document.createDocumentFragment();
  methods.forEach((method, index) => {
    const article = document.createElement("article");
    article.className = "contact-method";
    const number = document.createElement("span");
    number.textContent = String(index + 1).padStart(2, "0");
    const title = document.createElement("h3");
    title.textContent = method.label;
    article.append(number, title);
    if (method.href) {
      const link = document.createElement("a");
      link.className = "text-link";
      link.href = method.href;
      link.textContent = method.key === "instagram" ? "Open Instagram" : method.value;
      if (["instagram", "whatsapp"].includes(method.key)) { link.target = "_blank"; link.rel = "noopener noreferrer"; }
      article.append(link);
    } else {
      const pending = document.createElement("p");
      pending.textContent = "Details awaiting owner approval";
      article.append(pending);
    }
    fragment.append(article);
  });
  container.replaceChildren(fragment);
}

function setFieldError(field, message) {
  const error = document.querySelector(`#${field.id}-error`);
  field.setAttribute("aria-invalid", message ? "true" : "false");
  field.setCustomValidity(message);
  if (error) { error.textContent = message; error.hidden = !message; }
}

function validateField(field) {
  let message = "";
  const value = field.value.trim();
  if (field.required && !value) message = "This field is required.";
  else if (field.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) message = "Enter a valid email address.";
  else if (field.name === "phone" && !/^\+?[\d\s()-]{7,20}$/.test(value)) message = "Enter a valid phone or WhatsApp number.";
  else if (field.type === "date" && value && value < field.min) message = "Choose today or a future date.";
  setFieldError(field, message);
  return !message;
}

function validateForm() {
  const fields = [...form.querySelectorAll("input:not([type=hidden]), select, textarea")];
  const valid = fields.map(validateField).every(Boolean);
  if (!valid) fields.find((field) => field.getAttribute("aria-invalid") === "true")?.focus();
  return valid;
}

function buildDraft(data) {
  return [
    "Crafted Media enquiry",
    `Name: ${data.get("name")}`,
    `Phone / WhatsApp: ${data.get("phone")}`,
    `Email: ${data.get("email")}`,
    `Event type: ${data.get("eventType")}`,
    `Event date: ${data.get("eventDate")}`,
    `City / Location: ${data.get("location")}`,
    `Approximate budget: ${data.get("budget")}`,
    `Coverage: ${data.get("coverage")}`,
    `Story / vision: ${data.get("message")}`
  ].join("\n");
}

function buildWhatsAppUrl(message) {
  const number = contactConfig.whatsappNumber?.replace(/\D/g, "");
  return number ? `https://wa.me/${number}?text=${encodeURIComponent(message)}` : null;
}

function showResult(draft, sent) {
  draftOutput.textContent = draft;
  result.hidden = false;
  result.querySelector("[data-result-title]").textContent = sent ? "Your enquiry has been sent." : "Your enquiry draft is ready.";
  result.querySelector("[data-result-copy]").textContent = sent
    ? "Thank you. Keep this summary for your reference."
    : "Nothing has been sent or stored. Copy this summary now; direct delivery will activate after the business contact channel is approved.";
  const whatsappUrl = buildWhatsAppUrl(draft);
  whatsappLink.hidden = !whatsappUrl;
  if (whatsappUrl) whatsappLink.href = whatsappUrl;
  emailLink.hidden = !contactConfig.email;
  if (contactConfig.email) emailLink.href = `mailto:${contactConfig.email}?subject=${encodeURIComponent("Photography / film enquiry")}&body=${encodeURIComponent(draft)}`;
  result.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
}

async function sendEnquiry(data) {
  if (!contactConfig.formEndpoint) return false;
  const response = await fetch(contactConfig.formEndpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(Object.fromEntries(data.entries()))
  });
  if (!response.ok) throw new Error("The enquiry service did not accept this submission.");
  return true;
}

form?.addEventListener("input", (event) => {
  if (event.target.matches("input, select, textarea") && event.target.getAttribute("aria-invalid") === "true") validateField(event.target);
});

form?.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (submitting || !validateForm()) return;
  const data = new FormData(form);
  if (data.get("company")) return;
  if (Date.now() - startedAt < 1500) { formStatus.textContent = "Please take a moment to review your enquiry before continuing."; return; }
  const draft = buildDraft(data);
  const fingerprint = draft;
  if (fingerprint === lastFingerprint && Date.now() - lastPreparedAt < 10000) { formStatus.textContent = "This enquiry draft is already prepared below."; result.hidden = false; return; }
  submitting = true;
  submitButton.disabled = true;
  submitButton.textContent = contactConfig.formEndpoint ? "Sending…" : "Preparing…";
  formStatus.textContent = "";
  try {
    const sent = await sendEnquiry(data);
    lastFingerprint = fingerprint;
    lastPreparedAt = Date.now();
    showResult(draft, sent);
  } catch {
    formStatus.textContent = "We couldn’t send the enquiry. Your entries remain on this page; please try again or use an approved direct contact method.";
    formStatus.className = "form-status form-status--error";
  } finally {
    submitting = false;
    submitButton.disabled = false;
    submitButton.textContent = contactConfig.formEndpoint ? "Send enquiry" : "Prepare enquiry draft";
  }
});

document.querySelector("[data-copy-enquiry]")?.addEventListener("click", async (event) => {
  try {
    await navigator.clipboard.writeText(draftOutput.textContent);
    event.currentTarget.textContent = "Copied";
  } catch {
    draftOutput.focus();
    event.currentTarget.textContent = "Select the text to copy";
  }
});

document.querySelector("[data-new-enquiry]")?.addEventListener("click", () => {
  result.hidden = true;
  form.reset();
  startedAt = Date.now();
  form.querySelector("input")?.focus();
});

if (form) {
  addOptions(form.elements.eventType, eventTypes);
  addOptions(form.elements.budget, budgetRanges);
  addOptions(form.elements.coverage, coverageOptions);
  const today = new Date();
  form.elements.eventDate.min = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  submitButton.textContent = contactConfig.formEndpoint ? "Send enquiry" : "Prepare enquiry draft";
}
renderContactMethods();

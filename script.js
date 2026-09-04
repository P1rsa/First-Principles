(function () {
  'use strict';

  */
  const BOOKING_ENDPOINT = 'https://script.google.com/macros/s/AKfycbxWj4-3U4RxOR2KXvSzNhxylnRAm0UmplhyyA08WnM4v5ES_-O7BX9abn0ZOSZDL-Z5/exec';

  /* ============================================
     MOBILE NAV
     ============================================ */
  const menuToggle = document.getElementById('menu-toggle');
  const mobileNav = document.getElementById('mobile-nav');

  function closeMenu() {
    menuToggle.setAttribute('aria-expanded', 'false');
    mobileNav.classList.remove('is-open');
  }

  function openMenu() {
    menuToggle.setAttribute('aria-expanded', 'true');
    mobileNav.classList.add('is-open');
  }

  if (menuToggle && mobileNav) {
    menuToggle.addEventListener('click', function () {
      const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
      isOpen ? closeMenu() : openMenu();
    });

    mobileNav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', closeMenu);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeMenu();
    });
  }

  /* ============================================
     FOOTER YEAR
     ============================================ */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ============================================
     BOOKING FORM
     ============================================ */
  const form = document.getElementById('booking-form');
  if (!form) return;

  const goalSelect = document.getElementById('goal');
  const goalOtherWrap = document.getElementById('goalOtherWrap');
  const goalOtherInput = document.getElementById('goalOther');
  const submitBtn = document.getElementById('submit-btn');
  const formError = document.getElementById('form-error');
  const formSuccess = document.getElementById('form-success');

  // Show / hide the "please specify" field when Goal = Other
  goalSelect.addEventListener('change', function () {
    const isOther = goalSelect.value === 'Other';
    goalOtherWrap.hidden = !isOther;
    goalOtherInput.required = isOther;
    if (!isOther) {
      goalOtherInput.value = '';
      clearFieldError('goalOther');
    }
  });

  const requiredFields = [
    { id: 'childName', message: "Please enter the child's name." },
    { id: 'childAge', message: 'Please enter a valid age.' },
    { id: 'childGrade', message: "Please select the child's grade." },
    { id: 'goal', message: 'Please select a goal for tutoring.' },
    { id: 'aboutChild', message: "Please tell us a bit about your child's situation." },
    { id: 'phone', message: 'Please enter a phone number.' },
    { id: 'email', message: 'Please enter a valid email address.' }
  ];

  function setFieldError(id, message) {
    const input = document.getElementById(id);
    const errorEl = document.getElementById('err-' + id);
    if (!input) return;
    input.closest('.field').classList.add('has-error');
    if (errorEl) errorEl.textContent = message;
  }

  function clearFieldError(id) {
    const input = document.getElementById(id);
    const errorEl = document.getElementById('err-' + id);
    if (!input) return;
    input.closest('.field').classList.remove('has-error');
    if (errorEl) errorEl.textContent = '';
  }

  function isValidEmail(value) {
    if (value.indexOf(' ') !== -1) return false;
    const atIndex = value.indexOf('@');
    if (atIndex < 1 || atIndex !== value.lastIndexOf('@')) return false;
    const domain = value.slice(atIndex + 1);
    const dotIndex = domain.indexOf('.');
    return dotIndex > 0 && dotIndex < domain.length - 1;
  }

  function isValidPhone(value) {
    let digitCount = 0;
    for (let i = 0; i < value.length; i++) {
      if (value[i] >= '0' && value[i] <= '9') digitCount++;
    }
    return digitCount >= 7;
  }

  function validateForm() {
    let isValid = true;

    requiredFields.forEach(function (field) {
      clearFieldError(field.id);
      const input = document.getElementById(field.id);
      const value = input.value.trim();

      if (!value) {
        setFieldError(field.id, field.message);
        isValid = false;
        return;
      }

      if (field.id === 'email' && !isValidEmail(value)) {
        setFieldError(field.id, 'Please enter a valid email address.');
        isValid = false;
      }

      if (field.id === 'phone' && !isValidPhone(value)) {
        setFieldError(field.id, 'Please enter a valid phone number.');
        isValid = false;
      }

      if (field.id === 'childAge') {
        const age = Number(value);
        if (Number.isNaN(age) || age < 4 || age > 18) {
          setFieldError(field.id, 'Please enter an age between 4 and 18.');
          isValid = false;
        }
      }
    });

    if (goalSelect.value === 'Other') {
      clearFieldError('goalOther');
      if (!goalOtherInput.value.trim()) {
        setFieldError('goalOther', 'Please specify the goal.');
        isValid = false;
      }
    }

    return isValid;
  }

  function setLoading(isLoading) {
    submitBtn.disabled = isLoading;
    submitBtn.textContent = isLoading ? 'Sending…' : 'Send Request';
  }

  function showFormError(message) {
    formError.textContent = message;
    formError.hidden = false;
  }

  function hideFormError() {
    formError.hidden = true;
    formError.textContent = '';
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    hideFormError();

    if (!validateForm()) {
      const firstError = form.querySelector('.has-error');
      if (firstError) firstError.querySelector('input, select, textarea').focus();
      return;
    }

    const payload = {
      childName: document.getElementById('childName').value.trim(),
      childAge: document.getElementById('childAge').value.trim(),
      childGrade: document.getElementById('childGrade').value,
      goal: goalSelect.value === 'Other'
        ? 'Other: ' + goalOtherInput.value.trim()
        : goalSelect.value,
      aboutChild: document.getElementById('aboutChild').value.trim(),
      phone: document.getElementById('phone').value.trim(),
      email: document.getElementById('email').value.trim(),
      additionalInfo: document.getElementById('additionalInfo').value.trim()
    };

    if (!BOOKING_ENDPOINT || BOOKING_ENDPOINT.indexOf('REPLACE_WITH') === 0) {
      console.warn(
        'Booking form is not yet connected to Google Sheets. ' +
        'Set BOOKING_ENDPOINT in script.js — see SETUP_INSTRUCTIONS.md.'
      );
      showFormError(
        "This form isn't connected yet. Please reach us directly at " +
        "p1rsa.ak@gmail.com or +1 647 684 9876 in the meantime."
      );
      return;
    }

    setLoading(true);

    // text/plain avoids a CORS preflight request, which Apps Script web apps
    // don't handle. See SETUP_INSTRUCTIONS.md for details.
    fetch(BOOKING_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload)
    })
      .then(function (response) {
        if (!response.ok) throw new Error('Network response was not OK');
        return response.json();
      })
      .then(function (data) {
        if (data && data.result === 'error') throw new Error(data.error || 'Unknown error');
        form.hidden = true;
        formSuccess.hidden = false;
        formSuccess.focus();
      })
      .catch(function (err) {
        console.error('Booking submission failed:', err);
        showFormError(
          "Something went wrong sending your request. Please try again, or email us " +
          "directly at p1rsa.ak@gmail.com."
        );
      })
      .finally(function () {
        setLoading(false);
      });
  });

})();

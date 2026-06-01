import { useEffect } from 'react';
import {
  trackContact,
  trackLead,
  trackSchedule,
} from '../utils/metaPixel';

const GOOGLE_SCRIPT_URL =
  'https://script.google.com/macros/s/AKfycbxMkLnK86gOHDcyjyO2duiob5eVSnpcAN5ija3et0Uo28IJsJXkTUrAXuWtFtZgrks/exec';

function getNextWednesdayDeadline(): Date {
  const now = new Date();
  const targetDay = 3;
  const currentDay = now.getDay();
  let daysUntilTarget = targetDay - currentDay;
  if (daysUntilTarget <= 0) {
    daysUntilTarget += 7;
  }
  const targetDate = new Date(now);
  targetDate.setDate(now.getDate() + daysUntilTarget);
  targetDate.setHours(23, 59, 59, 999);
  return targetDate;
}

/**
 * Binds DOM interactions for the static landing markup (scroll, modal, form, WhatsApp).
 */
export function useLandingPageEffects(): void {
  useEffect(() => {
    const observerOptions: IntersectionObserverInit = { threshold: 0.1 };
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
        }
      });
    }, observerOptions);

    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));

    const onScroll = () => {
      const header = document.querySelector('header');
      if (!header) return;
      if (window.scrollY > 20) {
        header.classList.add('shadow-md');
      } else {
        header.classList.remove('shadow-md');
      }
    };
    window.addEventListener('scroll', onScroll);

    const deadline = getNextWednesdayDeadline();
    const updateCountdown = () => {
      const timerEl = document.getElementById('countdown-timer');
      if (!timerEl) return;

      const difference = deadline.getTime() - Date.now();
      if (difference <= 0) {
        timerEl.innerHTML = 'EXPIRED';
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
      );
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      timerEl.innerHTML = `${String(days).padStart(2, '0')}d ${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`;
    };
    updateCountdown();
    const countdownInterval = window.setInterval(updateCountdown, 1000);

    const popup = document.getElementById('apply-popup');
    const closePopupBtn = document.getElementById('close-popup');
    const dismissPopupBtn = document.getElementById('dismiss-popup-btn');
    let popupTimer: ReturnType<typeof setTimeout> | null = null;

    const showPopup = () => {
      popup?.classList.remove('translate-y-20', 'opacity-0', 'pointer-events-none');
      popup?.classList.add('translate-y-0', 'opacity-100', 'pointer-events-auto');
    };

    const hidePopup = () => {
      popup?.classList.remove('translate-y-0', 'opacity-100', 'pointer-events-auto');
      popup?.classList.add('translate-y-20', 'opacity-0', 'pointer-events-none');
      scheduleNextPopup();
    };

    const scheduleNextPopup = () => {
      if (popupTimer) clearTimeout(popupTimer);
      popupTimer = setTimeout(showPopup, 60000);
    };

    closePopupBtn?.addEventListener('click', hidePopup);
    dismissPopupBtn?.addEventListener('click', hidePopup);
    scheduleNextPopup();

    const applyModal = document.getElementById('apply-modal');
    const modalOverlay = applyModal?.querySelector('.relative');
    const modalBackdrop = document.getElementById('modal-backdrop');
    const closeModalBtn = document.getElementById('close-modal');
    const bookingForm = document.getElementById('booking-form') as HTMLFormElement | null;
    const bookingSuccess = document.getElementById('booking-success');
    const submitBtn = document.getElementById('submit-booking-btn') as HTMLButtonElement | null;
    const submitSpinner = document.getElementById('submit-spinner');
    const successDismissBtn = document.getElementById('success-dismiss-btn');
    const successChildName = document.getElementById('success-child-name');

    const openModal = () => {
      applyModal?.classList.remove('opacity-0', 'pointer-events-none');
      applyModal?.classList.add('opacity-100');
      modalOverlay?.classList.remove('scale-90', 'opacity-0');
      modalOverlay?.classList.add('scale-100', 'opacity-100');
    };

    const closeModal = () => {
      modalOverlay?.classList.remove('scale-100', 'opacity-100');
      modalOverlay?.classList.add('scale-90', 'opacity-0');

      window.setTimeout(() => {
        applyModal?.classList.remove('opacity-100');
        applyModal?.classList.add('opacity-0', 'pointer-events-none');
        bookingForm?.reset();
        bookingForm?.classList.remove('hidden');
        bookingSuccess?.classList.add('hidden');
        if (submitBtn) submitBtn.disabled = false;
        submitSpinner?.classList.add('hidden');
      }, 300);
    };

    const applyTriggerHandlers: Array<{ el: Element; handler: (e: Event) => void }> = [];
    document.querySelectorAll('.apply-trigger').forEach((el) => {
      const handler = (e: Event) => {
        e.preventDefault();
        openModal();
      };
      el.addEventListener('click', handler);
      applyTriggerHandlers.push({ el, handler });
    });

    modalBackdrop?.addEventListener('click', closeModal);
    closeModalBtn?.addEventListener('click', closeModal);
    successDismissBtn?.addEventListener('click', closeModal);

    const whatsappClickHandler = (e: Event) => {
      const target = e.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest('a[href*="wa.me"]');
      if (!anchor) return;
      trackContact({ content_name: 'WhatsApp' });
    };
    document.addEventListener('click', whatsappClickHandler);

    const onFormSubmit = (e: Event) => {
      e.preventDefault();
      if (!bookingForm) return;

      const childName = (
        document.getElementById('child-name') as HTMLInputElement
      ).value.trim();
      const grade = (document.getElementById('student-grade') as HTMLSelectElement).value;
      const countryCode = (
        document.getElementById('country-code') as HTMLSelectElement
      ).value;
      const phoneNumber = (
        document.getElementById('parent-whatsapp') as HTMLInputElement
      ).value.trim();
      const bestTime = (document.getElementById('best-time') as HTMLSelectElement).value;

      const digitsOnly = phoneNumber.replace(/\D/g, '');
      const isValidChar = /^[0-9\s\-()+]+$/.test(phoneNumber);
      const errorEl = document.getElementById('whatsapp-error');
      const inputEl = document.getElementById('parent-whatsapp');

      if (!isValidChar || digitsOnly.length < 7 || digitsOnly.length > 15) {
        errorEl?.classList.remove('hidden');
        inputEl?.classList.add(
          'border-red-500',
          'focus:ring-red-500',
          'focus:border-red-500',
        );
        (inputEl as HTMLInputElement | null)?.focus();
        return;
      }

      errorEl?.classList.add('hidden');
      inputEl?.classList.remove(
        'border-red-500',
        'focus:ring-red-500',
        'focus:border-red-500',
      );

      const whatsapp = `'${countryCode} ${phoneNumber}`;

      if (submitBtn) submitBtn.disabled = true;
      submitSpinner?.classList.remove('hidden');

      trackLead({
        content_name: 'Demo Booking Form',
        grade,
      });

      const popupEl = document.getElementById('apply-popup');
      popupEl?.classList.remove('translate-y-0', 'opacity-100', 'pointer-events-auto');
      popupEl?.classList.add('translate-y-20', 'opacity-0', 'pointer-events-none');
      scheduleNextPopup();

      const showSuccessScreen = () => {
        if (successChildName) successChildName.textContent = childName;
        bookingForm.classList.add('hidden');
        bookingSuccess?.classList.remove('hidden');
        trackSchedule({
          content_name: 'Free Demo Class',
          preferred_time: bestTime,
          grade,
        });
      };

      if (GOOGLE_SCRIPT_URL) {
        const formData = new URLSearchParams();
        formData.append('childName', childName);
        formData.append('grade', grade);
        formData.append('whatsapp', whatsapp);
        formData.append('bestTime', bestTime);

        fetch(GOOGLE_SCRIPT_URL, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: formData.toString(),
        })
          .then(() => showSuccessScreen())
          .catch((err) => {
            console.error('Submission error:', err);
            showSuccessScreen();
          });
      } else {
        const payload = {
          childName,
          grade,
          whatsapp,
          bestTime,
          timestamp: new Date().toISOString(),
        };
        const existingLeads = JSON.parse(
          localStorage.getItem('auraMindsLeads') || '[]',
        ) as unknown[];
        existingLeads.push(payload);
        localStorage.setItem('auraMindsLeads', JSON.stringify(existingLeads));
        window.setTimeout(showSuccessScreen, 600);
      }
    };

    bookingForm?.addEventListener('submit', onFormSubmit);

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', onScroll);
      window.clearInterval(countdownInterval);
      if (popupTimer) clearTimeout(popupTimer);
      closePopupBtn?.removeEventListener('click', hidePopup);
      dismissPopupBtn?.removeEventListener('click', hidePopup);
      applyTriggerHandlers.forEach(({ el, handler }) =>
        el.removeEventListener('click', handler),
      );
      modalBackdrop?.removeEventListener('click', closeModal);
      closeModalBtn?.removeEventListener('click', closeModal);
      successDismissBtn?.removeEventListener('click', closeModal);
      document.removeEventListener('click', whatsappClickHandler);
      bookingForm?.removeEventListener('submit', onFormSubmit);
    };
  }, []);
}

(() => {
  'use strict';
  const invitation = document.querySelector('.page-about .content a[href$="/contact/#ants"]');
  const parade = document.querySelector('#ant-parade');
  const template = document.querySelector('#ant-parade-ant');
  if (!invitation || !parade || !template) return;

  // Without JavaScript the invitation remains a useful link to Contact.
  const trigger = document.createElement('button');
  trigger.type = 'button';
  trigger.className = 'ant-invitation';
  trigger.textContent = invitation.textContent;
  trigger.setAttribute('aria-controls', parade.id);
  trigger.setAttribute('aria-expanded', 'false');
  invitation.replaceWith(trigger);

  const trail = parade.querySelector('.ant-parade-trail');
  const dismiss = parade.querySelector('.ant-parade-dismiss');
  const status = document.querySelector('.ant-parade-status');
  let timeout;

  function hide() {
    clearTimeout(timeout);
    if (document.activeElement === dismiss) trigger.focus({ preventScroll: true });
    parade.hidden = true;
    trail.replaceChildren();
    trigger.setAttribute('aria-expanded', 'false');
    status.textContent = '';
  }

  trigger.addEventListener('click', () => {
    hide();
    for (let index = 0; index < 3; index += 1) {
      const ant = template.content.firstElementChild.cloneNode(true);
      ant.style.setProperty('--ant-delay', `${index * .72}s`);
      ant.style.setProperty('--ant-position', `${25 + index * 25}%`);
      trail.append(ant);
    }
    parade.hidden = false;
    trigger.setAttribute('aria-expanded', 'true');
    status.textContent = 'The colony says hello. Three tiny ants have appeared at the bottom of the page. Press Escape to dismiss.';
    timeout = setTimeout(hide, 15000);
  });
  dismiss.addEventListener('click', hide);
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !parade.hidden) hide();
  });
  window.addEventListener('pagehide', hide);
})();

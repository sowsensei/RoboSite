(() => {
  const tabList = document.querySelector('.practice-tabs');
  const tabs = [...tabList.querySelectorAll('[role="tab"]')];
  const hashes = ['#theory', '#practice'];

  function selectTab(index) {
    tabs.forEach((tab, position) => {
      const selected = position === index;
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
      document.getElementById(tab.getAttribute('aria-controls')).hidden = !selected;
    });
  }

  function selectFromHash() {
    const practice = ['#practice', '#practice-panel', '#catch-game'].includes(location.hash);
    selectTab(practice ? 1 : 0);
  }

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => {
      selectTab(index);
      if (location.hash !== hashes[index]) history.pushState(null, '', hashes[index]);
    });
  });

  tabList.addEventListener('keydown', event => {
    const current = tabs.indexOf(event.target);
    if (current === -1) return;
    let next;
    if (event.key === 'ArrowRight') next = (current + 1) % tabs.length;
    else if (event.key === 'ArrowLeft') next = (current + tabs.length - 1) % tabs.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = tabs.length - 1;
    else return;
    event.preventDefault();
    tabs[next].focus();
    tabs[next].click();
  });

  window.addEventListener('hashchange', selectFromHash);
  selectFromHash();
})();

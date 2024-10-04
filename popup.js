//-*- js-indent-level: 2 -*-

// Mini logger. -- Logs stuff to `browser.storage.local` as an array (with the
// key '_'). If log is empty
// - log()         -- Append to log.
// - log.get(func) -- Invoke `func()` with the log as args.
// - log.clear()   -- Clear the log.
const log = (s => {
  const log = (...x) => s.get({ _: [] }).then(o => s.set({ _: o._.concat(x) }))
  log.get   = (f)    => s.get({ _: [] }).then(o => f(o._.join('\n')))
  log.clear = ()     => s.remove('_')
  return log
})(browser.storage.local)

// Elementary. Mini jQuery replacement replacement.
const $ = (() => {
  // $(selector|html) Return first element matching SELECTOR or first created
  // element in HTML. With non-text arg, return arg as-is.
  const elementary = x => typeof x !== 'string' ? x : x[0] === '<'
    ? new DOMParser().parseFromString(x, 'text/html').body.firstChild // HTML
    : document.querySelector(x) // CSS selector
  // $.on(selector, event, func, xtra...) Return undefined.
  const on = (s, e, f, ...x) => s === browser.tabs || s === browser.storage
    ? s[`on${e[0].toUpperCase()}${e.slice(1)}`].addListener(f, ...x)
    : $(s).addEventListener(e, f, ...x)
  // $.append((text|html|node)...)
  const append = (s, ...a) => $(s).append(...a.map(x => x[0] === '<' ? $(x) : x))
  return Object.assign(elementary, { append, on })
})()

/******************************************************************************/

function logShow() {
  log.get(l => $('textarea').value = l)
}

// Goto specified tab (focus window if necessary).
function tabSwitch(tabId) {
  browser.tabs.update(tabId, { active: true }).then(tab => {
    browser.windows.update(tab.windowId, { focused: true })
  })
}

// Load 'urllist' as history (by loading each URL in turn).
function tabCreateWithHistory(urllist) {
  function historyLoadItem(tabId, changeInfo) {
    if (changeInfo.status == 'complete') {
      browser.tabs.update({ url: urllist.shift() })
      if (urllist.length === 0) {
        browser.tabs.onUpdated.removeListener(historyLoadItem)
      }
    }
  }
  function historyLoad() {
  }
  browser.tabs.create({ url: urllist.shift() })
    .then(() => $.on(browser.tabs, 'updated', historyLoadItem))
}

function tabOpen(e) {
  const el = event.target.closest('.tab')  // clicked element
  if (el) {
    const tabId = Number(el.dataset.tabId)
    console.log('TABID:', typeof tabId, tabId)
    if (isNaN(tabId)) {                    // 'undefined'
      // create new tab with history
      console.log('TABID DOESNT EXIST:', el.dataset.tabId)
      return tabCreateWithHistory([
        'https://example.org',
        'https://www.iana.org/domains/reserved',
        'https://zrajm.github.io',
        'http://zrajm.org',
      ])
    } else {
      browser.tabs.get(tabId).then(tab => {  // tab is already open: go there
        tabSwitch(tabId)
      }, () => {                             // tab not open: re-open
        // create new tab with history
        console.log('TABID DOESNT EXIST:', el.dataset.tabId)
        return tabCreateWithHistory([
          'https://example.org',
          'https://www.iana.org/domains/reserved',
          'https://zrajm.github.io',
          'http://zrajm.org',
        ])
      })

    }

    // browser.tabs.get(tabId).then(tab => {  // tab is already open: go there
    //   tabSwitch(tabId)
    // }, () => {                             // tab not open: re-open
    //   console.log('TABID DOESNT EXIST:', el.dataset.tabId)
    //   return tabCreateWithHistory([
    //     'https://example.org',
    //     'https://www.iana.org/domains/reserved',
    //     'https://zrajm.github.io',
    //     'http://zrajm.org',
    //   ])
    //   // doesn't exist
    //   // tabSwitch(tabId)
    // })

  }
}

// FIXME: Handle re-opening of tabs (Ctrl-Shift-T) gracefully
// (Old entry should be renamed to match the re-opened tab.)

/*===========================================================================*/
/* Main */

// Listen for clicks on the buttons, and send the appropriate message to the
// content script in the page.
(function popupOpened() {
  $.on('#clear', 'click', log.clear)
  $.on('#out',   'click', tabOpen)
  $.on(browser.storage, 'changed', logShow)
  const e = $('#out')
  browser.storage.local.get().then((x) => {

    const hists = Object.keys(x)       // find key/values with tab history
      .filter(id => id.match(/^(\d+|[a-zA-z0-9_-]{22})$/))
      .map(id => {
        x[id][0].histId = id
        return x[id]
      })

    const histByWindow = Object.values( // split history one per window
      hists.reduce((a, x) => {
        const id = `winId:${x[0].windowId}`
        a[id] ??= []
        a[id].push(x)
        return a
      }, {})
    ).sort(([[{ windowId: a }]], [[{ windowId: b }]]) => (a > b) - (a < b)) // sort: tab order

    for (const win of histByWindow) {
      const winId = win[0][0].windowId
      $.append(
        e.appendChild($(`<div class="win ${winId !== undefined ? 'open' : 'closed'}">`)),
        ...win
          .sort(([{ index: a }], [{ index: b }]) => (a > b) - (a < b)) // sort: tab order
          .map(hist => {
            const { tabId, histId } = hist[0]             // common
            const { url, title } = hist[hist.length - 1]  // last entry
            return `<div class=tab data-tab-id="${tabId}" ` +
              `data-hist-id="${histId}" title="${url}\n(id: ${histId})">${title}`
          })
      )
    }

  })

})()

//[eof]

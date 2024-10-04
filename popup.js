//-*- js-indent-level: 2 -*-

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

function prettyDate(epoch) {
  return (new Date(epoch)).toISOString().replace(/T/, ' ').replace(/:[^:]*$/, '')
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

function makeHtmlTable(head, body) {
  return [
    '<thead>', [
      '<tr>', [
        head.map((column, i) =>
          `<th style="width:${column[1]}px">${column[0]}`)],
      '</tr>'],
    '</thead>', '<tbody>', [
      body.map((win, i) => [
        win.map(x => x.reverse()).map(tab => [
          `<tr class="win tab ${win.winId === Infinity ? 'closed' : 'open'}" title="${tab[0].title}\n${tab[0].url}\n(id: histId)">`, [
            `<td style="max-width:${head[0][1]}px">${win.winId === Infinity ? "[closed]" : i}</td>`,
            `<td style="max-width:${head[1][1]}px"><details><summary>${escapeHtml(tab[0].title)}</summary>`, [
              '<ul>', [
                tab.slice(1)
                  .map(histEntry => `<li>${escapeHtml(histEntry.title)}</li>`)],
              '</ul>'],
              '</details></td>',
            `<td style="max-width:${head[2][1]}px">${tab[0].url}</td>`,
            `<td style="max-width:${head[3][1]}px">${prettyDate(tab[0].lastAccessed)}</td>`,
          ], '</tr>',
        ]),
      ])],
    '<tbody>',
  ].flat(Infinity).join('')
}
function escapeHtml(text) {
  return text.replace(/["&<>]/g, a => (
    { '"': '&quot;', '&': '&amp;', '<': '&lt;', '>': '&gt;' }[a]
  ))
}

// Table sorter adapted from: https://stackoverflow.com/a/49041392/351162
function tableResortHandler(evt) {
  const $th    = evt.target.closest('th')
  const $body  = $th.closest('table').querySelector('tbody')
  const column = Array.from($th.parentNode.children).indexOf($th)
  const $rows  = Array.from($body.querySelectorAll('tr'))
    .sort(comparer(column, this.asc = !this.asc))
  if (this.asc) {
    $th.classList.add('ascending')
    $th.classList.remove('descending')
  } else {
    $th.classList.add('descending')
    $th.classList.remove('ascending')
  }
  $rows.forEach($tr => $body.appendChild($tr)) // moves each <tr>
}
// Return function for sorting specific column.
function comparer(column, asc) {  // column number + ascending order
  return (a, b) => {
    // This function is called immediately, is used to pass in args in
    // different order based on ascending/descending order.
    return ((v1, v2) => {
      // Sort based on a numeric or localeCompare.
      return (v1 !== '' && v2 !== '' && !isNaN(v1) && !isNaN(v2))
        ? v1 - v2
        : v1.toString().localeCompare(v2)
    })(getCellValue(asc ? a : b, column), getCellValue(asc ? b : a, column))
  }
}
function getCellValue($tr, column) {
  return $tr.children[column].innerText || $tr.children[column].textContent
}

// FIXME: Handle re-opening of tabs (Ctrl-Shift-T) gracefully
// (Old entry should be renamed to match the re-opened tab.)

/*===========================================================================*/
/* Main */

// Listen for clicks on the buttons, and send the appropriate message to the
// content script in the page.
(function popupOpened() {
  const $menu = $('#menu')
  $.on($menu, 'click', tabOpen)
  browser.storage.local.get().then((x) => {

    // Object with all the tabs.
    // { winId: [[tab, tabId:xx, index:xx], winId, ... }
    const xxx = Object.entries(x)
      .filter(([k]) => /^(\d+|[a-zA-z0-9_-]{22})$/.test(k))
      .reduce((a, [k, v], i) => {
        const meta = v.shift()
        const winId = meta.windowId ?? Infinity
        const tabId = meta.tabId, index = meta.index
        a[winId]  ??= Object.assign([], { winId })
        a[winId].push(Object.assign(v,  { tabId, index }))
      return a
    }, {})

    let tableHead = [['Win',65], ['Tab',350], ['URL',242], ['Time', 130]]
    let tableBody = Object.values(xxx)
      .sort((a, b) => a.winId - b.winId)     // sort windows
      .map(win =>                            // sort tabs
        win.winId === undefined
          ? win.sort((a, b) =>
            (a[a.length - 1] ?? '').localeCompare((b[b.length - 1] ?? '')))
          : win.sort((a, b) => a.index - b.index))

    console.log($menu.innerHTML = makeHtmlTable(tableHead, tableBody))
    console.log(document.body.offsetWidth)

    // Set up events for sorting.
    $.on($menu.querySelector('thead'), 'click', tableResortHandler)
  })

})()

//[eof]

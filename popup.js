//-*- js-indent-level: 2 -*-

import { $ } from './elementary.mjs'

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
    .then(() => $(browser.tabs).on('updated', historyLoadItem))
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
    '</thead>',
    '<tbody>', [
      body.map((win, i) => [
        win.map(x => x.reverse()).map(tab => [
          `<tr class="win tab ${win.winId === Infinity ? 'closed' : 'open'}" title="${tab[0].title}\n${tab[0].url}\n(id: histId)">`, [
            `<td>${win.winId === Infinity ? "[closed]" : i}</td>`,
            `<td><details><summary>${escapeHtml(tab[0].title)}</summary>`, [
              '<ul>', [
                tab.slice(1)
                  .map(histEntry => `<li>${escapeHtml(histEntry.title)}</li>`)],
              '</ul>'],
              '</details></td>',
            `<td>${tab[0].url}</td>`,
            `<td>${prettyDate(tab[0].lastAccessed)}</td>`,
          ], '</tr>',
        ]),
      ])],
    '</tbody>',
  ].flat(Infinity).join('')
}
function escapeHtml(text) {
  return text.replace(/["&<>]/g, a => (
    { '"': '&quot;', '&': '&amp;', '<': '&lt;', '>': '&gt;' }[a]
  ))
}

/* FIXME: Make sure Elementary is used everywhere here */
function makeTableResizable(table) {
  /* FIXME: Total width of table will glitch during column resize unless all
   * padding and border are set to 'px' (or are evenly divisible by px?), in
   * the CSS!! Or if the table width isn't set in the CSS. Also setting
   * 'overflow: hidden' on the body element seems to make a difference. */
  function getMinWidth(t) {
    const style = getComputedStyle(t)
    return (style.boxSizing === 'content-box'
      ? ['minWidth', 'paddingLeft', 'paddingRight', 'borderLeftWidth', 'borderRightWidth']
      : ['minWidth']
    ).reduce((a, p) => a + parseInt(style[p], 10), 0)
  }
  function makeColumnResizable($resizer, th1) {
    const $d = $(document), $root = $('html'), th2 = th1.nextSibling
    let x, min, max, w1, w2
    function mouseDown(e) {
      x = e.clientX
      ;[w1, w2] = [th1, th2].map(t => parseInt(getComputedStyle(t).width, 10))
      min = -(th1.offsetWidth - getMinWidth(th1))
      max =   th2.offsetWidth - getMinWidth(th2)
      // const width = th1.offsetWidth
      // $(th1).append(
      //   `<div style="position:absolute;top:0;left:${width + min-1}px;width:1px;height:100%;background:#000;z-index:100;height:${table.offsetHeight}px">`,
      //   `<div style="position:absolute;top:0;left:${width + max-1}px;width:1px;height:100%;background:#000;z-index:100;height:${table.offsetHeight}px">`)
      $d.on('mousemove', mouseMove)
      $d.on('mouseup',   mouseUp)
      $resizer.addClass('resizing')
      $root.addClass('resizing')
    }
    function mouseMove(e) {
      let dx = Math.min(max, Math.max(min, e.clientX - x))
      th1.style.width = `${w1 + dx}px`
      th2.style.width = `${w2 - dx}px`
    }
    function mouseUp(e) {
      $resizer.removeClass('resizing')
      $root.removeClass('resizing')
      $d.off('mousemove', mouseMove)
      $d.off('mouseup', mouseUp)
    }
    $resizer.on('mousedown', mouseDown)
    $resizer.on('click', e => e.stopPropagation())
  }
  $('th').slice(0, -1).forEach(th => {
    const $resizer = $('<div class=resizer>')
      .css({ height: table[0].offsetHeight })
    $(th).append($resizer)
    makeColumnResizable($resizer, th)
  })
}

// Table sorter adapted from: https://stackoverflow.com/a/49041392/351162
function tableResortHandler(evt) {
  const $th    = $(evt.target.closest('th'))
  const $body  = $th.closest('table').find('tbody')
  const column = $th.parent().children().indexOf($th[0])
  const $rows  = $body.find('tr').sort(comparer(column, this.asc = !this.asc))
  $body.append($rows)                          // move each <tr>
  if (this.asc) {
    $th.addClass('ascending')
    $th.removeClass('descending')
  } else {
    $th.addClass('descending')
    $th.removeClass('ascending')
  }
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
function getCellValue(tr, column) {
  return tr.children[column].innerText || tr.children[column].textContent
}

// FIXME: Handle re-opening of tabs (Ctrl-Shift-T) gracefully
// (Old entry should be renamed to match the re-opened tab.)

/*===========================================================================*/
/* Main */

// Listen for clicks on the buttons, and send the appropriate message to the
// content script in the page.
(function popupOpened() {
  const $menu = $('#menu')
  $menu.on('click', tabOpen)
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

    $menu.html(makeHtmlTable(tableHead, tableBody))
    makeTableResizable($menu)

    // Set up events for sorting.
    $menu.find('thead').on('click', tableResortHandler)
  })

})()

//[eof]

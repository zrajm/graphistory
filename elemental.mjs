//-*- mode: js; js-indent-level: 2 -*-

// Elemental. Mini jQuery replacement.
export const $ = x => new Elemental(x)
export class Elemental extends Array {
  #wordsplit(x) { return x.trim().split(/\s+/) }
  // Invoked with `$(CSS-selector|html|element|onloadCallback)`.
  // Return array of DOM Elements, with some added methods (similar to jQuery).
  constructor(x) {
    super()
    if (typeof x === 'function') { addEventListener('load', x); return }
    Object.assign(
      this, typeof x === 'string'
        ? (x[0] === '<'
           ? new DOMParser().parseFromString(x, 'text/html').body.children // HTML
           : document.querySelectorAll(x))   // CSS selector
        : x.length === undefined ? [x] : x)
  }
  /* traversal */
  forEach(...a) { super.forEach(...a); return this }
  parent() { return this.map(t => t.parentElement) } /* not uniqued! (jQuery does) */
  children() { return this.flatMap(t => [...t.children]) }
  /* query-esque */
  closest(x) { return this.map(t => t.closest(x)) } /* not uniqued! (jQuery does) */
  find(x) { return this.flatMap(t => [...t.querySelectorAll(x)]) }
  is(a) { return this.some(t => t.matches(a)) }
  /* events */
  on(e, ...a) {
    e = this.#wordsplit(e)
    return this.forEach($e => e.forEach(e => {
      if (typeof browser !== 'undefined' &&  // for Firefox plugins
          ($e === browser.tabs || $e === browser.storage)) {
        return $e[`on${e[0].toUpperCase()}${e.slice(1)}`].addListener(...a)
        }
      return $e.addEventListener(e, ...a)
    }))
  }
  off(e, ...a) {
    e = this.#wordsplit(e)
    return this.forEach($e => e.forEach(e => $e.removeEventListener(e, ...a)))
  }
  /* modification of DOM */
  html(a) { return a ? this.forEach(t => t.innerHTML = a) : this[0].innerHTML }
  append(...a) {
    a = a.map(x => /^</.test(x) ? $(x) : x)
      .flatMap(x => x instanceof Elemental ? x : [x])
    return this.forEach(t => t.append(...a))
  }
  addClass   (x) { return this.forEach(t => t.classList.add   (x)) }
  removeClass(x) { return this.forEach(t => t.classList.remove(x)) }
  css(css = {}) {
    css = Object.entries(css)
    return this.forEach(t => css.forEach(([k, v]) =>
      t.style[k] = `${v}${typeof v === 'number' ? 'px' : ''}`
    ))
  }
}

//[eof]

How it's supposed to work
=========================

* Transparent, out-of-the way. You can open and close tabs to you hearts
  content (using the usual browser buttons). The GUI is only for finding and
  re-opening old tabs.

* 




For Later
=========
* Window awareness: When a window is closed, bunch all the tabs together.

* Archive-y: All data is saved. Forever.

* Data should be synced between browsers on different computers. (I shouldn't
  have to remember which computer I was using at a particular time, it should
  just Be There™ – even if the tab in question is still open on a different
  computer.)

================================================================================
This is intended as some kinda tab saver and restorer. It preserves tab history
when saving and restoring tabs.


In it's primitive first stage there are two things; windows and tabs. A window
contain one or more tabs. Either a single window, or a whole tab may be saved.
Each window (session) may be given a name.

In some kinda future we might instead use differently colored tabs for
different sessions (e.g. a blue, a brown and a yellow session) which would then
be able to coexist in the same tab.

The GUI should present stuffs as collapsible lists. Each window may have zero
or more tabs, and each tab may have zero or more history entries. History entry
0 is the current URL in the window, thereafter come historical entries.

When dragging these entries one should be able to convert a history entry into
a new tab, and a tab into a new window (though history a tabs history is not
modifiable, except by opening a tab and navigating around in it).

History may also contain future history (with negative indices). Though this
would be pretty rare. If present, these should prolly go at the beginning of
the history list (since it would be kinda uncommon for them to be more than a
few anyway).

  * Window
    > Tab 1
    > Tab 2
    > Tab 3
      + History -1
      + History -2
      ------------
      + History 1
      + History 2
      + History 3

Tabcryo
=======

Tabcryo is a work in progress. It’s not fully functional yet.

-------------------------------------------------------------------------------

Wouldn’t it be great to be able restore old, closed tabs complete with their
entire history? Wouldn’t it be nice to be able to indiscriminately close tabs
without fear of losing context, because you know you can restore them exactly
as they were at any point? This Firefox extension is attempting to solve this
problem.

<!-- How I want to work. -->When I work on something (anything, a research
project, a programming task, or just doing a deep dive into the etymology of a
word and its origins) I find myself googling things, *lots of things*, opening
up web pages, articles etc. At the beginning of the project I usually open up a
new browser window and over the course of an afternoon (or a week) the tabs
multiply. When I switch back to working on an older project, I minimize the
current one, and find the old window. This is a great way of working for *me,*
but with hundreds of tabs open, spread across dozens of different windows, my
computer doesn’t think it’s so great.

<!-- Why it’s a problem. -->My computer isn’t the fanciest out there, and I
often find it down on its knees begging for mercy from the CPU-chugging
trickster god of Firefox. (And Chrome, when I was using it, was no better.) On
top of that I’m always teetering on the edge of memory abyss, where swapping
takes over and my computer does nothing but chew on it’s harddrive for minutes
on end. Not fun. When I restart the browser, it gets a little better, memory
consumption goes down, but the restarting itself (with all the tabs and the
windows having to be reloaded) is *slooooww.* Not fun either.

<!-- Why the obvious solution doesn’t work. -->I could just close my tabs and
windows I, and bookmark the one’s I want to revisit, but then I lose the
*context.* The order of the tabs in my window, each tab’s browser history – all
the stuff that I used to orient myself. Sure, Firefox have lists of recently
closed tabs and windows, but I don’t want “recently”, I want *reliability.*
Nothing is supposed to just disappear. And I can’t help but think that it is a
failure of all the major browsers not to provide this.

<!-- How Tabcryo tries to solve this -->Enter this Firefox extension. It saves
your history continuously, and when you close a tab or a window it’s not gone,
but put in the freezer until you need it again. Your history (present and old)
is searchable, and if you something you want to look at, just open it to rethaw
and continue where you left off.


How it’s supposed to work
=========================
* A menu for searching. Press Alt+L for a dropdown where you may search or
  scroll through tabs and windows. Selecting a tab (or window) will load that
  tab (complete with its history) or switch to it, if it is already open.

* Want to be able to give a window a title (like with [Window Titler]) and save
  this as a window name, in the history.

[Window Titler]: https://addons.mozilla.org/en-US/firefox/addon/window-titler/

<!--

Wanted
======
* Window awareness: When a window is closed, bunch all the tabs together.

* Archive-y: All data is saved. Forever.

* Data should be synced between browsers on different computers. (I shouldn’t
  have to remember which computer I was using at a particular time, it should
  just Be There™ – even if the tab in question is still open on a different
  computer.)

In it’s primitive first stage there are two things; windows and tabs. A window
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
-->

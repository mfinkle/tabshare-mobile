TabShare for Firefox Android
============================

Basic restartless add-on built from Brad Lassey's example code in [bug 742832](https://bugzilla.mozilla.org/show_bug.cgi?id=742832).

Once installed, you have a "share tab" camera option when starting a WebRTC session. If you decide to share a tab, you can choose the specific tab you want from a list.

Note that the backend currently always only shares the top box of the document,
[bug 952625](https://bugzilla.mozilla.org/show_bug.cgi?id=952625) is now on file
to make it possible to share scrolling viewports as well.

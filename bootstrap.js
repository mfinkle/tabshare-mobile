const { classes: Cc, interfaces: Ci, manager: Cm, utils: Cu, results: Cr } = Components;

Cu.import("resource://gre/modules/Services.jsm");
Cu.import("resource://gre/modules/XPCOMUtils.jsm");
Cu.import("resource://gre/modules/Prompt.jsm");

let TabSourceService = {
  classID: Components.ID("{8b194d54-9977-11e3-b4d8-7f9a39b2bff1}"),
  classDescription: "Simple Tab Source Service",
  contractID: "@mozilla.org/tab-source-service;1",
  QueryInterface: XPCOMUtils.generateQI([Ci.nsITabSource, Ci.nsIFactory]),

	// nsIFactory interface implementation
	createInstance: function(outer, iid) {
		if (outer)
			throw Cr.NS_ERROR_NO_AGGREGATION;
		return this.QueryInterface(iid);
	},

  register: function() {
		let registrar = Cm.QueryInterface(Ci.nsIComponentRegistrar);
		registrar.registerFactory(this.classID, this.classDescription, this.contractID, this);
  },

  unregister: function() {
    // This needs to run asynchronously, see bug 753687
    let registrar = Cm.QueryInterface(Ci.nsIComponentRegistrar);
    Services.tm.currentThread.dispatch(function() {
      registrar.unregisterFactory(this.classID, this);
    }.bind(this), Ci.nsIEventTarget.DISPATCH_NORMAL);
  },

  getTabToStream: function() {
    let app = Services.wm.getMostRecentWindow("navigator:browser").BrowserApp;
    let tabs = app.tabs;
    if (tabs == null || tabs.length == 0) {
      Services.console.logStringMessage("ERROR: No tabs");
      return null;
    }

    // First, let's decide on which feed to subscribe
    let prompt = new Prompt({
      window: null
    }).setSingleChoiceItems(tabs.map(function(tab) {
      return { label: tab.browser.contentTitle || tab.browser.contentURI.spec }
    }));

    let result = null;
    prompt.show(function(data) {
      result = data.button;
    });

    // Spin this thread while we wait for a result.
    let thread = Services.tm.currentThread;
    while (result == null)
      thread.processNextEvent(true);

    if (result == -1)
      return null;
    
    return tabs[result].browser.contentWindow;
  }
};

/**
* Handle the add-on being activated on install/enable
*/
function startup(data, reason) {
  TabSourceService.register();
}

/**
* Handle the add-on being deactivated on uninstall/disable
*/
function shutdown(data, reason) {
  TabSourceService.unregister();
}

/**
* Handle the add-on being installed
*/
function install(data, reason) {}

/**
* Handle the add-on being uninstalled
*/
function uninstall(data, reason) {}

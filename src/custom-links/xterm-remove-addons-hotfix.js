// Function to remove old addons.
// XXX This is a hack but not sure of a better way.
function hotfixRemoveOldAddons(xterm) {
  console.log("xterm-remove-addons-hotfix: Cleaning up original addons", [
    ...xterm._addonManager._addons,
  ]);

  xterm._addonManager._addons.forEach((addon) => {
    // Name isn't preserved after minification so we have to infer which is
    // the WebLinksAddOn in xterm.js v4 or v5
    if (
      addon &&
      addon.instance &&
      (addon.instance._useLinkProvider !== undefined ||
        addon.instance._linkProvider !== undefined)
    ) {
      console.log(
        "xterm-remove-addons-hotfix: Removing old WebLinksAddon",
        addon
      );
      addon.instance.dispose();
    }
  });

  console.log("xterm-remove-addons-hotfix: Updated addons", [
    ...xterm._addonManager._addons,
  ]);
}

module.exports = { hotfixRemoveOldAddons };

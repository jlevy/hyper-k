// Filter out version update notifications.
// It unfortunatley is pushing notifs for v3.4* when we are already running v4.0 prerelease.
const middleware = (store) => (next) => (action) => {
  const isVersionUpdate = action.type === "UPDATE_AVAILABLE";

  if (isVersionUpdate) {
    console.log(
      "notifications: suppressing version update notification",
      action
    );
    return;
  }
  return next(action);
};

module.exports = { middleware };

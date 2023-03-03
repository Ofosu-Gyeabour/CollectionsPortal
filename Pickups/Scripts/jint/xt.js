Ext.onReady(function () {
    Ext.get('logoff').on('click', function (e, t) {
        Ext.MessageBox.confirm("Log Off?", "Are you sure you want to log out of the system?", function (btn) {
            if (btn == "yes") {
                $.getJSON('/User/SystemLogOut', {}, function (msg) {
                    if (msg.status.toString() == "true") {
                        window.location = "/";
                    }
                }, "json");
            } else { window.location = "/"; }
        });
    });
});

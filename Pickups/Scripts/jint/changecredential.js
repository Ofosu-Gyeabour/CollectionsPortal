Ext.onReady(function () {

    Ext.get('usrconfig').on('click', function (e, t) {
        new Ext.Window({
            id: 'adminWin', title: 'User Configuration', height: 400, width: '800', closable: true,
            resizable: false, modal: true, movable: true, layout: 'column',
            defaults: { xtype: 'panel', border: true, height: 'auto' },
            items: [
                {
                    height: 360, width: '40%',
                    defaults: { xtype: 'form', height: 200, frame: true, border: true, collapsible: true },
                    layout: 'accordion',
                    items: [
                        {
                            id: 'createCredentialsFrm', title: 'CREATE USER', width: '100%',
                            defaults: { xtype: 'textfield', anchor: '90%', allowBlank: false },
                            labelAlign: 'left',
                            items: [
                                {
                                    xtype: 'combo', id: 'stNo', fieldLabel: 'Staff', mode: 'local',
                                    store: new Ext.data.Store({
                                        autoLoad: true, restful: true, url: '/Utility/getStaffList',
                                        reader: new Ext.data.JsonReader({}, [
                                            { name: 'staffId', type: 'string' },
                                            { name: 'Id', type: 'int' }
                                        ])
                                    }),displayField: 'staffId', valueField: 'Id',allowBlank: false, forceSelection: true,typeAhead: true
                                },
                                { id: 'username', fieldLabel: 'User name', emptyText: 'enter user name' },
                                { id: 'curP', fieldLabel: 'Current Password', inputType: 'password' },
                                { id: 'newP', fieldLabel: 'New Password', inputType: 'password' },
                                { id: 'confirmP', fieldLabel: 'Confirmation', inputType: 'password' }
                            ],
                            buttons: [
                                {
                                    text: 'Save',
                                    handler: function (btn) {
                                        var thisF = Ext.getCmp('createCredentialsFrm').getForm();
                                        if (thisF.isValid()) {
                                            if (Ext.fly('newP').getValue() == Ext.fly('confirmP').getValue()) {
                                                $.post('/User/CreateUserCredentials',
                                                {
                                                    staffNo : Ext.fly('stNo').getValue(),
                                                    usr: Ext.fly('username').getValue(),
                                                    newP: Ext.fly('newP').getValue()
                                                },
                                                function (stat) {
                                                    if (stat.status.toString() == "true") {
                                                        Ext.Msg.alert("CREATE CREDENTIALS", "User created successfully", this);
                                                    }
                                                    else { Ext.Msg.alert("CREATE CREDENTIALS", stat.msg.toString(), this); }
                                                }, "json");
                                            }
                                        }
                                        else { Ext.Msg.alert("CHANGE PASSWORD", "Some required fields were not entered. Please enter all required fields", this); }
                                    }
                                },
                                        {
                                            text: 'Close',
                                            handler: function (btn) {
                                                Ext.getCmp('adminWin').close();
                                            }
                                        }
                            ]
                        },
                        {
                            id: 'changeCredentialsFrm', title: 'MODIFY USER', height: 100, width: '100%',
                            defaults: { xtype: 'textfield', anchor: '90%', allowBlank: false },
                            labelAlign: 'left',
                            items: [
                                { id: 'usr', fieldLabel: 'User name', emptyText: 'enter user name' },
                                { id: 'currentP', fieldLabel: 'Current Password', inputType: 'password' },
                                { id: 'newPwd', fieldLabel: 'New Password', inputType: 'password' },
                                { id: 'confirmPwd', fieldLabel: 'Confirmation', inputType: 'password' }
                            ],
                            buttons: [
                                {
                                    text: 'Save',
                                    handler: function (btn) {
                                        var thisF = Ext.getCmp('changeCredentialsFrm').getForm();
                                        if (thisF.isValid()) {
                                            if (Ext.fly('newPwd').getValue() == Ext.fly('confirmPwd').getValue()) {
                                                $.post('/User/UpdateUserCredentials',
                                                    {
                                                        usr: Ext.fly('usr').getValue(),
                                                        currentP: Ext.fly('currentP').getValue(),
                                                        newP: Ext.fly('newPwd').getValue()
                                                    },
                                                    function (stat) {
                                                        if (stat.status.toString() == "true") {
                                                            Ext.Msg.alert("CHANGE CREDENTIALS", "Password changed successfully", this);
                                                        }
                                                        else { Ext.Msg.alert("CHANGE CREDENTIALS", stat.msg.toString(), this); }
                                                    }, "json");
                                            }
                                        }
                                        else { Ext.Msg.alert("CHANGE PASSWORD", "Some required fields were not entered. Please enter all required fields", this); }
                                    }
                                },
                                {
                                    text: 'Close',
                                    handler: function (btn) {
                                        Ext.getCmp('adminWin').close();
                                    }
                                }
                            ]
                        }
                    ]
                },
                {
                    title: 'USER LIST', width: '60%',
                    items: [
                        new Ext.grid.GridPanel({
                            id: 'userList', width: '100%',
                            store: new Ext.data.Store({
                                id: 'usrList',
                                autoLoad: true, url: '/Utility/getUserList',
                                restful: true,
                                reader: new Ext.data.JsonReader({}, [
                                    { name: 'userId' },
                                    { name: 'username', type: 'string' },
                                    { name: 'logStatDescription', type: 'string' },
                                    { name: 'activeStatDescription', type: 'string' }
                                ])
                            }),
                            columns: [
                                { id: 'userId', header: 'ID', width: 40, sortable: true, hidden: true, dataIndex: 'userId' },
                                { id: 'username', header: 'USER NAME', width: 90, sortable: true, hidden: false, dataIndex: 'username' },
                                { id: 'logStatDescription', header: 'LOG STATUS', width: 80, sortable: true, hidden: false, dataIndex: 'logStatDescription' },
                                { id: 'activeStatDescription', header: 'ACTIVE STATUS', width: 80, sortable: true, hidden: false, dataIndex: 'activeStatDescription' }
                            ]
                            , stripeRows: true, autoExpandColumn: 'username', height: 230, autoScroll: true, viewConfig: { forceFit: true },
                            listeners: {
                                'rowclick': function (grid, rowIndex, e) {
                                    var record = grid.getStore().getAt(rowIndex);
                                    selectedRecord = parseInt(record.get('userId'));
                                    var usr = record.get('username');

                                    Ext.getCmp('usr').setValue(usr.toString());
                                },
                                'afterrender': function () {
                                    //handle = setInterval(getUsrs, 10000);
                                }
                            }
                        })
                    ]
                }
            ]
        }).show();

    });


});
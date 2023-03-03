Ext.onReady(function () {
    Ext.QuickTips.init();

    var getScheduleList = function (cbovalue) {

        var myMask = new Ext.LoadMask(Ext.getCmp('grdLeave').el, { useMsg: false });

        $.getJSON('/LeaveScheduler/getScheduleOfStaff',
            { leavestatus: cbovalue }, function (dta) {
                if (dta.status.toString() == "true") {
                    myMask.show();

                    var grdDta = new Array();
                    var i = 0;

                    Ext.each(dta.msg, function (obj) {
                        grdDta[i] = [obj.Id, obj.staffNo, obj.staffName, obj.dtFrom, obj.dtTo, obj.department];
                        i++;
                    });

                    myMask.hide();

                    Ext.getCmp('grdLeave').getStore().removeAll();
                    Ext.getCmp('grdLeave').getStore().loadData(grdDta);

                }
            });
    };

    var clearLvRec = function () {
        $('#startingd').val('').attr('readonly', true);
        $('#leavet').val('').attr('readonly', true);
        $('#dtaken').val('').attr('readonly', true);
        $('#xtra').val('').attr('readonly', true);
        $('#totd').val('').attr('readonly', true);
        $('#resumption').val('').attr('readonly', true);
    };

 
    var tt = Ext.get('leaveappn').on('click', function (e, t) {

        var tt = Ext.getCmp('tt');

        if (!tt) {

            new Ext.Window({
                id: 'tt', title: 'Leave Application Form', height: 615, width: 1070, defaults: { xtype: 'panel', frame: true },
                layout: 'border', resizable: false,
                items: [
                    {
                        region: 'west', collapsible: true, frame: false, width: 150,
                        items: [
                                {
                                    xtype: 'treepanel', id: 'PFprocesses', width: 250, height: 900,
                                    autoScroll: true, frame: true, border: true,
                                    root: {
                                        text: 'Leave Info Center', expanded: true,
                                        children: [
                                            {
                                                text: 'Staff Info', id: 'prLeave', leaf: true,
                                                listeners: {
                                                    'click': function (node) {
                                                        Ext.getCmp('staffPanel').layout.setActiveItem(0);
                                                    }
                                                }
                                            },
                                            {
                                                text: 'Applications', id: 'lgout', leaf: true,
                                                listeners: {
                                                    'click': function (node) {
                                                        Ext.getCmp('staffPanel').layout.setActiveItem(1);

                                                    }
                                                }
                                            }
                                        ]
                                    }
                                }
                        ]
                    },
                    {
                        region: 'center', width: 600,
                        items: [
                            new Ext.Panel({
                                id: 'staffPanel', defaults: { xtype: 'panel' }, height: 600, width: 900,
                                layout: 'card', autoScroll: true, activeItem: 0,
                                items: [
                                    {
                                        id: 'xx', height: '100%', defaults: { xtype: 'panel' }, layout: 'column', width: 800,
                                        items: [
                                            {
                                                height: 400, defaults: { xtype: 'form', frame: true },
                                                columnWidth: .4, collapsible: false, layout: 'form', height: 'auto',
                                                items: [
                                                            {
                                                                id: 'stDataEntry',title:'Staff Information', defaults: { xtype: 'textfield', anchor: '95%', allowBlank: false }, labelAlign: 'top', collapsible: true,
                                                                items: [
                                                                    { id: 'stffno', fieldLabel: 'Staff No', emptyText: 'enter staff No' },
                                                                    { id: 'stfsn', fieldLabel: 'Surname', emptyText: 'enter surname of staff' },
                                                                    { id: 'stfothers', fieldLabel: 'Other names', emptyText: 'enter other names of staff' },
                                                                    { id: 'sttle', fieldLabel: 'Title', emptyText: 'enter salutation of staff', xtype: 'combo', mode: 'local', store: ['Mr', 'Mrs', 'Ms', 'Dr', 'Prof'], typeAhead: true, forceSelection: true, allowBlank: false },
                                                                    {
                                                                        xtype: 'combo', id: 'stdpt', fieldLabel: 'Department', emptyText: 'select department name', mode: 'local', allowBlank: false,
                                                                        store: new Ext.data.Store({
                                                                            autoLoad: true, restful: true, url: '/Helper/getDepartment',
                                                                            reader: new Ext.data.JsonReader({}, [
                                                                                { name: 'departmentId', type: 'int' },
                                                                                { name: 'nameOfdepartment', type: 'string' }
                                                                            ])
                                                                        }), valueField: 'departmentId', displayField: 'nameOfdepartment'
                                                                    }
                                                                ]
                                                            },
                                                            {
                                                                id: 'frmLvDuration', title: 'Leave duration', collapsible: true, defaults: { xtype: 'datefield', anchor: '90%', allowBlank: false },
                                                                labelAlign: 'top', frame: true,
                                                                items: [
                                                                    { id: 'lvst', fieldLabel: 'Leave starting', format: 'd-m-Y' },
                                                                    { id: 'lvend', fieldLabel: 'Leave ending', format: 'd-m-Y' },
                                                                    { id: 'ladd', xtype: 'textfield', fieldLabel: 'additional days', emptyText: 'enter additional days' }
                                                                ]
                                                            }
                                                    ],
                                                    buttons: [
                                                        {
                                                            text: 'Save Staff Record',
                                                            handler: function () {
                                                                var thisF = Ext.getCmp('stDataEntry').getForm();
                                                                var lvF = Ext.getCmp('frmLvDuration').getForm();

                                                                if (thisF.isValid() && lvF.isValid()) {

                                                                    if (Ext.getCmp('lvst').getValue() < Ext.getCmp('lvend').getValue()) {

                                                                        $.post('/LeaveScheduler/StaffDataEntry',
                                                                        {
                                                                            stNo: Ext.fly('stffno').getValue(), sname: Ext.fly('stfsn').getValue(),
                                                                            onames: Ext.fly('stfothers').getValue(), title: Ext.fly('sttle').getValue(),
                                                                            dpt: Ext.fly('stdpt').getValue(), stdte: Ext.fly('lvst').getValue(),
                                                                            enddte: Ext.fly('lvend').getValue(), xtra: Ext.fly('ladd').getValue()
                                                                        },
                                                                        function (msg) {
                                                                            if (msg.status.toString() == "true") {
                                                                                Ext.Msg.alert("LEAVE SCHEDULER", msg.msg.toString(), this);
                                                                                thisF.reset();
                                                                            }
                                                                        }, "json");
                                                                    }
                                                                    else {
                                                                        Ext.Msg.alert("error", "starting date cannot be later than ending date", this);
                                                                        $('#lvst').focus();
                                                                    }

                                                                }
                                                                else { Ext.Msg.alert("LEAVE SCHEDULER", "Please enter all required fields to continue", this); }
                                                            }
                                                        },
                                                        {
                                                            text: 'Close',
                                                            handler: function () {
                                                                Ext.getCmp('tt').close();
                                                            }
                                                        }
                                                        
                                                    ]
                                                },
                                                {
                                                    id: 'stList', columnWidth: .6, height: '100%', defaults: { xtype: 'form' },
                                                    items: [

                                                        new Ext.grid.GridPanel({
                                                            id: 'grdStaff', title: 'Staff Leave List', height: 540, autoScroll: true,
                                                            store: new Ext.data.GroupingStore({
                                                                reader: new Ext.data.ArrayReader({}, [
                                                                    { name: 'Id', type: 'int' },
                                                                    { name: 'surname', type: 'string' },
                                                                    { name: 'staffNo', type: 'string' },
                                                                    { name: 'department', type: 'string' },
                                                                    { name: 'dateFrom', type: 'string' },
                                                                    { name: 'dateTo', type: 'string' }
                                                                ]), sortInfo: { field: 'Id', direction: 'ASC' }, groupField: 'department'
                                                            }),
                                                            columns: [
                                                                { id: 'Id', header: 'ID', width: 20, hidden: true, sortable: true, dataIndex: 'Id' },
                                                                { id: 'surname', header: 'STAFF', width: 120, hidden: false, sortable: true, dataIndex: 'surname' },
                                                                { id: 'staffNo', header: 'STAFF No', width: 50, hidden: false, sortable: true, dataIndex: 'staffNo' },
                                                                { id: 'department', header: 'DEPARTMENT', width: 80, hidden: true, sortable: true, dataIndex: 'department' },
                                                                { id: 'dateFrom', header: 'FROM', width: 80, hidden: false, sortable: true, dataIndex: 'dateFrom' },
                                                                { id: 'dateTo', header: 'TO', width: 80, hidden: false, sortable: true, dataIndex: 'dateTo' }
                                                            ], stripeRows: true, autoExpandColumn: 'surname',

                                                            view: new Ext.grid.GroupingView({
                                                                forceFit: true,
                                                                groupTextTpl: '{text} ({[values.rs.length]} {[values.rs.length > 1 ? "Staff" : "Item"]})',
                                                                getRowClass: function (record, index) {
                                                                    var c = record;
                                                                    if ((index % 1) > 0) {
                                                                        return 'odd';
                                                                    } else { return 'even'; }
                                                                }
                                                            }), frame: true, collapsible: true, animCollapse: false, iconCls: 'icon-grid',
                                                            listeners: {
                                                                'afterrender': function () {
                                                                    $.getJSON('/LeaveScheduler/getStaffData', {}, function (dta) {
                                                                        if (dta.status.toString() == "true") {
                                                                            var myMask = new Ext.LoadMask(Ext.getCmp('grdStaff').el, { useMsg: false });
                                                                            myMask.show();
                                                                            var grdDta = new Array();
                                                                            var i = 0;

                                                                            Ext.each(dta.msg, function (obj) {
                                                                                grdDta[i] = [obj.Id, obj.surname + " " + obj.othernames, obj.staffNo, obj.department, obj.dateFrom, obj.dateTo];

                                                                                i++;
                                                                            });

                                                                            myMask.hide();

                                                                            Ext.getCmp('grdStaff').getStore().removeAll();
                                                                            Ext.getCmp('grdStaff').getStore().loadData(grdDta);

                                                                        }
                                                                    });
                                                                }
                                                            }
                                                        }),
                                                        {
                                                            tpl: new Ext.XTemplate(
                                                                '<a id="atstList" style="display:none" href="{path}">Payment Schedule Report (PDF)</a>'
                                                            ), compiled: true, data: { path: '/Report/PrintStaffList' }, autoScroll: true
                                                        }
                                                    ],
                                                    buttons: [
                                                        {
                                                            text: 'Print',
                                                            handler: function () {
                                                                $.post('/Report/isValidPost', {}, function (msg) {
                                                                    if (msg.status.toString() == "true") {
                                                                        window.open(document.getElementById('atstList').href, '_blank');
                                                                    }
                                                                });
                                                            }
                                                        }
                                                    ]
                                                }
                                            ]
                                        },
                                        {
                                            id: 'staffAppn', height: '100%', defaults: { xtype: 'panel', frame: true }, layout: 'column',
                                            items: [
                                                {
                                                    defaults: { xtype: 'form', frame: true }, layout: 'form', columnWidth: .5,
                                                    items: [
                                                        {
                                                            id: '', defaults: { xtype: 'combo' }, title: 'Leave status',
                                                            items: [
                                                                {
                                                                    id: 'cbostate', fieldLabel: 'Select Status', anchor: '90%', mode: 'local', store: ['', 'Pending', 'Approved'], forceSelection: true, allowBlank: false,
                                                                    listeners: {
                                                                        'select': function () {
                                                                            Ext.getCmp('grdLeave').getStore().removeAll();
                                                                            clearLvRec();
                                                                            getScheduleList(Ext.getCmp('cbostate').getValue());
                                                                        }
                                                                    }
                                                                }
                                                            ]
                                                        },
                                                        {
                                                            items:
                                                                [
                                                                       new Ext.grid.GridPanel({
                                                                           id: 'grdLeave', title: 'Staff Leave Applications', height: 400, autoScroll: true,
                                                                           store: new Ext.data.GroupingStore({
                                                                               reader: new Ext.data.ArrayReader({}, [
                                                                                   { name: 'Id', type: 'int' },
                                                                                   { name: 'staffNo', type: 'string' },
                                                                                   { name: 'staffName', type: 'string' },
                                                                                   { name: 'dtFrom', type: 'string' },
                                                                                   { name: 'dtTo', type: 'string' },
                                                                                   { name: 'department', type: 'string' },
                                                                               ]), sortInfo: { field: 'Id', direction: 'ASC' }, groupField: 'department'
                                                                           }),
                                                                           columns: [
                                                                               { id: 'Id', header: 'ID', width: 40, hidden: true, sortable: true, dataIndex: 'Id' },
                                                                               { id: 'staffNo', header: 'STAFF No', width: 50, hidden: false, sortable: true, dataIndex: 'staffNo' },
                                                                               { id: 'staffName', header: 'STAFF', width: 60, hidden: false, sortable: true, dataIndex: 'staffName' },
                                                                               { id: 'dtFrom', header: 'DATE FROM', width: 70, hidden: false, sortable: true, dataIndex: 'dtFrom' },
                                                                               { id: 'dtTo', header: 'DATE TO', width: 80, hidden: false, sortable: true, dataIndex: 'dtTo' },
                                                                               { id: 'department', header: 'DEPARTMENT', width: 60, hidden: true, sortable: true, dataIndex: 'department' }
                                                                           ], stripeRows: true, autoExpandColumn: true,
                                                                           view: new Ext.grid.GroupingView({
                                                                               forceFit: true,
                                                                               groupTextTpl: '{text} ({[values.rs.length]} {[values.rs.length > 1 ? "Staff" : "Item"]})',
                                                                               getRowClass: function (record, index) {
                                                                                   var c = record;
                                                                                   console.log(c);
                                                                                   if ((index % 1) > 0) {
                                                                                       return 'odd';
                                                                                   } else { return 'even'; }
                                                                               }
                                                                           }), frame: true, collapsible: true, animCollapse: false, iconCls: 'icon-grid',
                                                                           listeners: {
                                                                               'afterrender': function () {
                                                                                   Ext.getCmp('cbostate').setValue('Pending');
                                                                                   getScheduleList(Ext.getCmp('cbostate').getValue());
                                                                               },

                                                                               'rowclick': function (grid, rowIndex, e) {

                                                                                   record = grid.getStore().getAt(rowIndex);

                                                                                   clearLvRec();

                                                                                   $.getJSON('/Helper/getLeaveHistory', { staffNo: record.get('staffNo'), lstatus: Ext.getCmp('cbostate').getValue() }, function (dta) {
                                                                                       $.each(dta, function (i, obj) {
                                                                                           Ext.getCmp('startingd').setValue(obj.startingDate);
                                                                                           Ext.getCmp('leavet').setValue(obj.leavetype);
                                                                                           Ext.getCmp('dtaken').setValue(obj.entitledDays);
                                                                                           Ext.getCmp('xtra').setValue(obj.travelDays);
                                                                                           Ext.getCmp('totd').setValue(obj.totalLeaveDays);
                                                                                           Ext.getCmp('resumption').setValue(obj.endingDate);
                                                                                       });
                                                                                   });

                                                                               }

                                                                           }
                                                                       })

                                                                ]
                                                        }
                                                    ]
                                                },
                                                {
                                                    columnWidth: .5,
                                                    defaults: { xtype: 'form', frame: true },
                                                    items: [
                                                        {
                                                            id: 'strpt', title: 'Staff Leave Record', defaults: { anchor: '90%', allowBlank: false }, labelAlign: 'top',
                                                            items: [
                                                                { xtype: 'textfield', id: 'startingd', fieldLabel: 'starting date' },
                                                                { xtype: 'textfield', id: 'leavet', fieldLabel: 'leave type' },
                                                                { xtype: 'textfield', id: 'dtaken', fieldLabel: 'days taken' },
                                                                { xtype: 'textfield', id: 'xtra', fieldLabel: 'extra days' },
                                                                { xtype: 'textfield', id: 'totd', fieldLabel: 'total days' },
                                                                { xtype: 'textfield', id: 'resumption', fieldLabel: 'Resumption date' },
                                                                {
                                                                    tpl: new Ext.XTemplate(
                                                                        '<a id="at" style="display:none" href="{path}">Payment Schedule Report (PDF)</a>'
                                                                    ), compiled: true, data: { path: '/Report/PrintLetter' }, autoScroll: true
                                                                }
                                                            ],
                                                            buttons: [
                                                                {
                                                                    text: 'Approve Leave Application',
                                                                    handler: function (btn) {
                                                                        var rform = Ext.getCmp('strpt').getForm();
                                                                        if (rform.isValid()) {
                                                                            $.post('/LeaveScheduler/Approve',
                                                                                {
                                                                                    stNo: record.get('staffNo'), startingDate: Ext.fly('startingd').getValue(),
                                                                                    endingDate: Ext.fly('resumption').getValue(), status: "A"
                                                                                }, function (msg) {
                                                                                    if (msg.status.toString() == "true") {
                                                                                        Ext.Msg.alert("APPROVED", msg.msg.toString(), this);
                                                                                        Ext.getCmp('grdLeave').getStore().removeAll();

                                                                                        getScheduleList(Ext.getCmp('cbostate').getValue());


                                                                                        clearLvRec();
                                                                                    }
                                                                                }, "json");
                                                                        }
                                                                        else { Ext.Msg.alert("MISSING FIELDS", "Please enter all missing fields to proceed", this); }
                                                                    }
                                                                },
                                                                {
                                                                    text: 'Print Letter',
                                                                    handler: function () {
                                                                        if (record.get('staffNo') != null) {
                                                                            $.post('/LeaveScheduler/SaveLeaveHistory',
                                                                                            {
                                                                                                sNo: record.get('staffNo'), status: ''
                                                                                            },
                                                                                            function (msg) {
                                                                                                if (msg.status.toString() == "true") {

                                                                                                    window.open(document.getElementById('at').href, '_blank');

                                                                                                }

                                                                                            }, "json");
                                                                        }
                                                                    }
                                                                },
                                                                {
                                                                    text: 'Reject Leave Application',
                                                                    handler: function (btn) {
                                                                        var rform = Ext.getCmp('strpt').getForm();
                                                                        if (rform.isValid()) {
                                                                            $.post('/LeaveScheduler/Revoke',
                                                                                {
                                                                                    stNo: record.get('staffNo'), startingDate: Ext.fly('startingd').getValue(),
                                                                                    endingDate: Ext.fly('resumption').getValue(), status: "R"
                                                                                }, function (msg) {
                                                                                    if (msg.status.toString() == "true") {
                                                                                        Ext.Msg.alert("APPROVED", msg.msg.toString(), this);
                                                                                        Ext.getCmp('grdLeave').getStore().removeAll();
                                                                                        clearLvRec();
                                                                                        getScheduleList(Ext.getCmp('cbostate').getValue());
                                                                                    }
                                                                                });
                                                                        }
                                                                    }
                                                                }
                                                            ]
                                                        }
                                                    ]
                                                }
                                            ]
                                        }
                                    ]
                            })
                        ]
                    }
                ]
            }).show();

        }

    });


});
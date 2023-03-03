
Ext.onReady(function () {
    Ext.QuickTips.init();

    var xlsPic = "/Images/xls.jpg";
    var xlsPicx = "/Images/xlsx.jpg";
    var selectedRecord = 0;
    var rsult = "true";

    var getDaysLeft = function (st, df, dt) {

        if (st.length > 0 && df.length > 0 && dt.length > 0) {
            if (df > dt) { Ext.Msg.alert("LEAVE SCHEDULER", "Date Ending of leave cannot be earlier than commencement date", this); }
            else
            {
                $.getJSON('/Helper/GetOutstandingDays',
                { staffNo: st, dfrom: df, dto: dt },
                function (msg) {
                    if (msg.status.toString() == "error") {
                        Ext.Msg.alert(msg.status.toString(), msg.msg.toString(), this);
                    }
                    else {
                        Ext.getCmp('outst').setValue(msg.msg);
                    }
                });
            }
        }

    };

    var getScheduleData = function () {
        $.getJSON('/Helper/getScheduleData', { strParam: '*' }, function (msg) {
            Ext.getCmp('lvgrd').getStore().removeAll();
            Ext.getCmp('lvgrd').getStore().load(msg);
        })
    };

    var getTotDays = function (sNo, nDays, nExtra, ctrl, stdte, retCtrl) {
        var result = 0;
        if (sNo.length > 0 && nDays.length > 0 && nExtra.length > 0) {
            result = (parseInt(nDays) + parseInt(nExtra));

            $.getJSON('/Helper/determineResumptionDate',
                { startingDte: stdte, duration: result },
                function (msg) {
                    retCtrl.setValue(msg.toString());
                });

            ctrl.setValue(result);
        }
    };

    var pleave = function (stNo, stat) {
        $.getJSON('/Helper/PendingStatus',
            { sNo: stNo, strStatus: stat }, function (msg) {
                rsult = msg.status.toString();
        });
    }

    Ext.get('leave').on('click', function (e, t) {
        
        var LeavePanel = new Ext.Panel({
            height: 450, layout: 'column', defaults: { xtype: 'form', frame: true, border: true },
            items: [
                {
                    xtype: 'form', title: 'Leave Schedule', columnWidth: .6,
                    items: [
                        {
                            tpl: new Ext.XTemplate(
                                '<div style="max-width:1000px;max-height:100%;">',
                                    '<b style="font-size:18px;">Leave Scheduled Period:</b>&nbsp&nbsp<strong><b style="color:green;font-size:16px;">{period}</b></strong>',
                                '</div><br>',

                                '<div style="max-width:340px;max-height:100%;">',
                                    '<b style="font-size:18px;">Travel Days:</b>&nbsp&nbsp<strong><b style="color:green;font-size:16px;">{tdays}</b></strong>',
                                '</div><br>',

                                '<div style="max-width:340px;max-height:100%;">',
                                    '<b style="font-size:18px;">Total Days:</b>&nbsp&nbsp<strong><b style="color:green;font-size:16px;">{totdays}</b></strong>',
                                '</div><br>'
                            ),
                            id: 'lscheduleDta', compiled: true, data: { period: '', tdays: '', totdays: '' }
                        }
                    ]
                },
                {
                    id: 'ldetailsFrm', title: 'Leave Details', columnWidth: .4,
                    listeners: {
                        'afterrender': function () {
                            $.getJSON('/Report/GetBalanceSheet', {}, function (msg) {
                                console.log(msg.msg);
                                var ir = []; var i = 0;
                                var prd = ''; var xtraD = 0; var totD = 0;
                                Ext.each(msg.msg, function (item) {
                                    console.log(item);
                                    ir[i] = [item.Id, item.strStarting, item.strEnding, item.leaveDuration, item.Balance];
                                    prd = item.strDateFrom.toString() + ' - ' + item.strDateTo.toString() + ' (' + item.leaveDays.toString() + ')';
                                    xtraD = item.travelDays.toString();
                                    totD = (item.leaveDays + item.travelDays).toString();
                                    i++;
                                });

                                Ext.getCmp('lscheduleDta').update({ period: prd, tdays: xtraD, totdays: totD, });
                                Ext.getCmp('lvdetailsgrd').getStore().removeAll();
                                Ext.getCmp('lvdetailsgrd').getStore().loadData(ir);
                            });
                        }
                    },
                    items: [
                        new Ext.grid.GridPanel({
                            id: 'lvdetailsgrd', height: 380, autoScroll: true,
                            store: new Ext.data.Store({
                                reader: new Ext.data.ArrayReader({}, [
                                    { name: 'Id', type: 'int' },
                                    { name: 'strStarting', type: 'string' },
                                    { name: 'strEnding', type: 'string' },
                                    { name: 'leaveDuration', type: 'string' },
                                    { name: 'Balance', type: 'string' },
                                ])
                            }),
                            columns: [
                                { id: 'Id', header: 'ID', hidden: true, width: 40, sortable: true, dataIndex: 'Id' },
                                { id: 'starting', header: 'Starting', hidden: false, width: 80, sortable: true, dataIndex: 'strStarting' },
                                { id: 'ending', header: 'Ending', hidden: false, width: 80, sortable: true, dataIndex: 'strEnding' },
                                { id: 'daysTaken', header: 'Days Taken', hidden: false, width: 80, sortable: true, dataIndex: 'leaveDuration' },
                                { id: 'daysLeft', header: 'Days Left', hidden: false, width: 80, sortable: true, dataIndex: 'Balance' }
                            ], stripeRows: true, autoExpandColumn: 'Period',
                            viewConfig: {
                                forceFit: true,
                                getRowClass: function (record, index) {
                                    var c = record;
                                    if ((index % 1) > 0) {
                                        return 'odd';
                                    } else { return 'even'; }
                                }
                            }
                        }),
                        {
                            xtype: 'panel',
                            items: [
                                {
                                    tpl: new Ext.XTemplate(
                                        '<a id="rptbal" style="display:none" href="{path}">Payment Schedule Report (PDF)</a>'
                                    ), compiled: true, data: { path: '/Report/PrintBalanceSheet' }, autoScroll: true
                                }
                            ]
                        }
                    ],
                    buttons: [
                        {
                            text: 'Print Report',
                            handler: function (btn) {
                                $.post('/Report/SetBalanceParam', { strParam: '*', issession: true },
                                    function (msg) {
                                        if (msg.toString() == "true") {
                                            window.open(document.getElementById('rptbal').href, '_blank');
                                        }
                                    }, "json");
                            }
                        }
                    ]
                }
            ]
        });

        var ApplicationPanel = new Ext.Panel({
            id: 'appForm', defaults: { xtype: 'panel', frame: true }, height:450, layout: 'accordion',
            items: [
                /*
                {
                    xtype: 'panel', title: 'Staff and Leave Data Entry', defaults: { xtype: 'form', frame: true, border: true },height:'100%', layout: 'column',
                    items: [
                        {
                            id: 'stDataEntry', title: 'Staff Entry', defaults: { xtype: 'textfield', anchor: '70%', allowBlank: false }, columnWidth: .5,
                            items: [
                                { id: 'stffno', fieldLabel: 'Staff No', emptyText: 'enter staff No' },
                                { id: 'stfsn', fieldLabel: 'Surname', emptyText: 'enter surname of staff' },
                                { id: 'stfothers', fieldLabel: 'Other names', emptyText: 'enter other names of staff' },
                                { id: 'sttle', fieldLabel: 'Title', xtype: 'combo', mode: 'local', store: ['Mr', 'Mrs', 'Ms', 'Dr', 'Prof'], typeAhead: true, forceSelection: true, allowBlank: false },
                                {
                                    xtype: 'combo', id: 'stdpt', fieldLabel: 'Department', emptyText: 'select department name', mode: 'local', allowBlank: false,
                                    store: new Ext.data.Store({
                                        autoLoad: true, restful: true, url: '/Helper/getDepartment',
                                        reader: new Ext.data.JsonReader({}, [
                                            { name: 'departmentId', type: 'int' },
                                            { name: 'nameOfdepartment', type: 'string' }
                                        ])
                                    }), valueField: 'departmentId', displayField: 'nameOfdepartment'
                                },
                                {
                                    xtype: 'button', width: '40%', text: 'Save',
                                    listeners: {
                                        'click': function () {
                                            var thisF = Ext.getCmp('stDataEntry').getForm();
                                            if (thisF.isValid()) {

                                                $.post('/LeaveScheduler/StaffDataEntry',
                                                    {
                                                        stNo: Ext.fly('stffno').getValue(), sname: Ext.fly('stfsn').getValue(),
                                                        onames: Ext.fly('stfothers').getValue(), title: Ext.fly('sttle').getValue(),
                                                        dpt: Ext.fly('stdpt').getValue()
                                                    },
                                                    function (msg) {
                                                        if (msg.status.toString() == "true") {
                                                            Ext.Msg.alert("LEAVE SCHEDULER", msg.msg.toString(), this);
                                                            thisF.reset();
                                                        }
                                                    }, "json");

                                            }
                                            else { Ext.Msg.alert("LEAVE SCHEDULER", "Please enter all required fields to continue", this); }
                                        }
                                    }
                                }
                            ]
                        },
                        {
                            id: 'scheduleEntryFrm', title: 'Leave Entry', defaults: { xtype: 'textfield', anchor: '70%', allowBlank: false }, columnWidth: .5,
                            items: [
                                {
                                    id: 'stNos', fieldLabel: 'Staff No',
                                    listeners: {
                                        'blur': function () {
                                            console.log('determine if staff exist');
                                            $.getJSON('/Helper/doesStaffExist', { stNo: this.getValue() }, function (msg) {
                                                if (msg.status.toString() == "false") { Ext.Msg.alert("INVALID STAFF", "Staff does not exist in the database"); $('#stNos').val(''); }
                                                else {
                                                    getDaysLeft(Ext.fly('stNos').getValue(), Ext.fly('dtf').getValue(), Ext.fly('dtt').getValue());
                                                }
                                            });
                                        }
                                    }
                                },
                                {
                                    xtype: 'datefield', id: 'dtf', fieldLabel: 'Date From',
                                    listeners: {
                                        'afterrender': function () { $('#dtf').attr('readonly', true); },
                                        'blur': function () { getDaysLeft(Ext.fly('stNos').getValue(), Ext.fly('dtf').getValue(), Ext.fly('dtt').getValue()); }
                                    }
                                },
                                {
                                    xtype: 'datefield', id: 'dtt', fieldLabel: 'Date To',
                                    listeners: {
                                        'afterrender': function () { $('#dtt').attr('readonly', true); },
                                        'blur': function () { getDaysLeft(Ext.fly('stNos').getValue(), Ext.fly('dtf').getValue(), Ext.fly('dtt').getValue()); }
                                    }
                                },
                                {
                                    xtype: 'numberfield', id: 'ldays', fieldLabel: 'Leave Days', emptyText: 'enter the no. of leave days'
                                },
                                {
                                    id: 'tdays', xtype: 'numberfield', fieldLabel: 'Travel Days', emptyText: 'enter days outstanding'
                                },
                                {
                                    xtype: 'button', text: 'Save Leave Schedule',
                                    listeners: {
                                        'click': function () {
                                            var tF = Ext.getCmp('scheduleEntryFrm').getForm();
                                            if (tF.isValid()) {
                                                try {
                                                    $.post('/LeaveScheduler/LeaveScheduleEntry',
                                                    {
                                                        stNo: Ext.fly('stNos').getValue(), dtFrm: Ext.fly('dtf').getValue(),
                                                        dtTo: Ext.fly('dtt').getValue(), ldays: Ext.fly('ldays').getValue(),
                                                        tdays: Ext.fly('tdays').getValue()
                                                    },
                                                    function (msg) {
                                                        if (msg.status.toString() == "true") {
                                                            Ext.Msg.alert("LEAVE SCHEDULER", msg.msg.toString(), this);
                                                            tF.reset();
                                                        }
                                                    }, "json");
                                                }
                                                catch (e) { Ext.Msg.alert("ERROR!!!", e.message, this); }
                                            }
                                            else { Ext.Msg.alert("LEAVE SCHEDULER", "Please enter all required fields to continue", this); }
                                        }
                                    }
                                }
                            ]
                        }
                    ]
                },

                **/

                {
                    title: 'Leave Application Module', xtype: 'panel', defaults: { xtype: 'form', frame: true, border: true }, layout: 'column',
                    items: [
                        {
                            xtype: 'panel', columnWidth: .5, defaults: { xtype: 'form', frame: true, border: true },
                            items: [
                                 {
                                     title: 'Search', layout: 'column', defaults: { xtype: 'textfield', anchor: '60%', allowBlank: false },
                                     items: [
                                         {
                                             xtype: 'textfield', id: 'snum', fieldLabel: 'Staff No', emptyText: 'enter staff No', columnWidth: .3,
                                             listeners: {
                                                 'render': function () {
                                                     $.getJSON('/User/getUser', {}, function (msg) {
                                                         $('#snum').val(msg.username.toString()).attr('readonly', true);
                                                         $('#btnStSearch').trigger('click');
                                                     });
                                                     
                                                 }
                                             }
                                         },
                                         {
                                             xtype: 'button', id:'btnStSearch', text: 'Search for Staff', columnWidth: .2,
                                             handler: function (btn) {
                                                 $.getJSON('/Helper/getSnapshot', { stNo: Ext.fly('snum').getValue() }, function (msg) {
                                                     Ext.getCmp('scontrol').update({ ldata: msg.totalLeaveDays.toString(), adata: msg.accumulatedDays.toString(), availdata: msg.availableDays.toString() });
                                                 });
                                                 $.getJSON('/Helper/getLeaveHistory',
                                                     { staffNo: Ext.fly('snum').getValue() },
                                                     function (dta) {
                                                         var data = []; var i = 0;
                                                         Ext.each(dta, function (item) {
                                                             data[i] = [item.LId, item.startingDate, item.endingDate, item.leavetype, item.entitledDays, item.travelDays, item.yeargroup];
                                                             i++;
                                                             console.log(data);
                                                         });
                                                         
                                                         Ext.getCmp('histgrd').getStore().removeAll();
                                                         Ext.getCmp('histgrd').getStore().loadData(data);
                                                     });
                                             }
                                         }
                                     ]
                                 },
                                 {
                                     id: 'applFrm', title: 'application', defaults: { xtype: 'numberfield', anchor: '90%', allowBlank: false },
                                     items: [
                                        { xtype: 'datefield', id: 'std', fieldLabel: 'Starting Date', listeners: { 'afterrender': function () { $('#std').attr('readonly', true); } } },
                                        {
                                            xtype: 'combo', id: 'ltyps', fieldLabel: 'Leave Type', forceSelection: true, typeAhead: true, mode: 'local',
                                            store: new Ext.data.Store({
                                                autoLoad: true, restful: true, url: '/Helper/GetLeaveTypes',
                                                reader: new Ext.data.JsonReader({}, [
                                                    { name: 'Id', type: 'int' },
                                                    { name: 'typeOfleave', type: 'string' }
                                                ])
                                            }), valueField: 'Id', displayField: 'typeOfleave'
                                        },
                                        {
                                            id: 'dtk', fieldLabel: 'Days Taken', listeners: {
                                                'blur': function () {
                                                    getTotDays(Ext.fly('snum').getValue(), Ext.fly('dtk').getValue(), Ext.fly('xday').getValue(), Ext.getCmp('totd'), Ext.fly('std').getValue(), Ext.getCmp('resumpDte'));
                                                }
                                            }
                                        },
                                        {
                                            id: 'xday', fieldLabel: 'Extra Days', listeners: {
                                                'blur': function () {
                                                    getTotDays(Ext.fly('snum').getValue(), Ext.fly('dtk').getValue(), Ext.fly('xday').getValue(), Ext.getCmp('totd'), Ext.fly('std').getValue(), Ext.getCmp('resumpDte'));
                                                }
                                            }
                                        },
                                        { id: 'totd', fieldLabel: 'Total Days' },
                                        { xtype: 'textfield', id: 'resumpDte', fieldLabel: 'Resumption Date', listeners: { 'afterrender': function () { $('#resumpDte').attr('readonly', true); } } },
                                        {
                                            xtype: 'panel',
                                            items: [
                                                {
                                                    tpl: new Ext.XTemplate(
                                                        '<a id="at" style="display:none" href="{path}">Payment Schedule Report (PDF)</a>'
                                                    ), compiled: true, data: { path: '/Report/PrintLetter' }, autoScroll: true
                                                }
                                            ]
                                        },
                                        {
                                            xtype: 'panel',
                                            items: [
                                                {
                                                    tpl: new Ext.XTemplate(
                                                        '<a id="rptbal" style="display:none" href="{path}">Payment Schedule Report (PDF)</a>'
                                                    ), compiled: true, data: { path: '/Report/PrintBalanceSheet' }, autoScroll: true
                                                }
                                            ]
                                        }
                                     ],
                                     buttons: [
                                         {
                                             text: 'Apply',
                                             handler: function (btn) {
                                                 Ext.MessageBox.confirm("Continue?", "This action will save leave record.Do you want to continue?", function (btn) {
                                                     if (btn == "yes")
                                                     {
                                                         var appF = Ext.getCmp('applFrm').getForm();
                                                         if (appF.isValid() && (Ext.fly('snum').getValue().length > 0))
                                                         {

                                                             $.getJSON('/Helper/PendingStatus',
                                                             { sNo: Ext.fly('snum').getValue(), strStatus: 'P' }, function (msg) {
                                                                 rsult = msg.status.toString();
                                                                 if (msg.status == false)
                                                                 {
                                                                     var x = Ext.fly('std').getValue()

                                                                     $.post('/LeaveScheduler/SaveLeaveHistory',
                                                                     {
                                                                         sNo: Ext.fly('snum').getValue(), sdte: x, edte: Ext.fly('resumpDte').getValue(),
                                                                         Ltype: Ext.fly('ltyps').getValue(), days: Ext.fly('dtk').getValue(), xtra: Ext.fly('xday').getValue(),
                                                                         tot: Ext.fly('totd').getValue(),status: "*"
                                                                     },
                                                                     function (msg) {
                                                                         if (msg.status.toString() == "true") {
                                                                             Ext.Msg.alert("LEAVE SCHEDULER", msg.msg.toString(), this);
                                                                             Ext.MessageBox.confirm("Print Letter?", "Proceed to print Leave Letter?", function (btn) {
                                                                                 if (btn == "yes") {
                                                                                     window.open(document.getElementById('at').href, '_blank');
                                                                                 }
                                                                                 appF.reset();
                                                                                 Ext.getCmp('snum').setValue('');
                                                                                 Ext.getCmp('scontrol').update({ ldata: '', adata: '', availdata: '' });
                                                                             });
                                                                         }

                                                                     }, "json");
                                                                 } else { Ext.Msg.alert("Pending Leave Application", "You already have a pending application. Delete it to create a new one"); }
                                                             });

                                                         } else { Ext.Msg.alert("Error", "Please enter all relevant fields to proceed", this); }
                                                     } else { console.log('do nothing'); }
                                                 });
                                             }
                                         }
                                     ]
                                 }
                            ]
                        },
                        {
                            xtype: 'panel', title: 'Leave History', defaults: { xtype: 'form', frame: true, border: true }, columnWidth: .5, layout: 'form', height: 400,
                            items: [
                                {
                                    title: 'Leave Snapshot', height: 70,
                                    items: [
                                        {
                                            tpl: new Ext.XTemplate(
                                              '<div style="max-width:340px;max-height:100%;">',
                                                    '<b style="font-size:20px;">Total Leave Days:</b>&nbsp&nbsp<strong><b style="color:green;font-size:20px;">{ldata}</b></strong>',
                                               '</div>',

                                                '<div style="max-width:340px;max-height:100%;">',
                                                    '<b style="font-size:20px;">Available Days:</b>&nbsp&nbsp<strong><b style="color:green;font-size:20px;">{adata}</b></strong>',
                                               '</div>'
                                            ), id: 'scontrol', compiled: true, data: { ldata: '', adata: '', availdata: '' }
                                        }
                                    ]
                                },
                                {
                                    height: 230,
                                    items: [
                                        new Ext.grid.GridPanel({
                                            id: 'histgrd',title: 'History', height: 200, autoScroll: true,
                                            store: new Ext.data.GroupingStore({
                                                reader: new Ext.data.ArrayReader({}, [
                                                    { name: 'LId', type: 'int' },
                                                    { name: 'startingDate', type: 'string' },
                                                    { name: 'endingDate', type: 'string' },
                                                    { name: 'leavetype', type: 'string' },
                                                    { name: 'travelDays', type: 'int' },
                                                    { name: 'yeargroup', type: 'string' }
                                                ]), sortInfo: { field: 'LId', direction: 'ASC' }, groupField: 'yeargroup'
                                            }),
                                            columns: [
                                                 { id: 'LId', header: 'ID', width: 40, hidden: true, sortable: true, dataIndex: 'LId' },
                                                 { id: 'startingDate', header: 'STARTING DATE', width: 40, hidden: false, sortable: true, dataIndex: 'startingDate' },
                                                 { id: 'endingDate', header: 'ENDING DATE', width: 40, hidden: false, sortable: true, dataIndex: 'endingDate' },
                                                 { id: 'leavetype', header: 'LEAVE TYPE', width: 40, hidden: false, sortable: true, dataIndex: 'leavetype' },
                                                 { id: 'travelDays', header: 'TRAVEL DAYS', width: 40, hidden: false, sortable: true, dataIndex: 'travelDays' },
                                                 { id: 'yeargroup', header: 'YEAR', width: 40, hidden: false, sortable: true, dataIndex: 'yeargroup' }
                                            ], stripeRows: true, autoExpandColumn: 'startingDate',
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
                                                'rowclick': function (grid, rowIndex, e) {
                                                    var record = grid.getStore().getAt(rowIndex);
                                                    console.log(record);
                                                }
                                            }
                                        })
                                    ],
                                    buttons: [
                                        {
                                            text: 'Print Letter',
                                            handler: function (btn) {
                                                if ((Ext.fly('snum').getValue().length > 0)) {
                                                    $.post('/Report/SetReportParameter', { strParam: Ext.fly('snum').getValue() },
                                                        function (msg) {
                                                            if (msg.toString() == "true") {
                                                                window.open(document.getElementById('at').href, '_blank');
                                                            }
                                                        }, "json");
                                                }
                                            }
                                        },
                                        {
                                            text: 'Print Report',
                                            handler: function (btn) {
                                                if ((Ext.fly('snum').getValue().length > 0)) {
                                                    $.post('/Report/SetBalanceParam', { strParam: Ext.fly('snum').getValue(), issession: false },
                                                        function (msg) {
                                                            if (msg.toString() == "true") {
                                                                window.open(document.getElementById('rptbal').href, '_blank');
                                                            }
                                                        }, "json");
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
        });

        var PresenterPanel = new Ext.Panel({
            id: 'PresenterPanel', defaults: { xtype: 'panel' },
            layout: 'card', autoScroll: true, activeItem: 0,
            items: [
                LeavePanel,
                ApplicationPanel
            ]
        });

        var lvDashboard = Ext.getCmp('lvdashbrd');

        if (!lvDashboard) {

            new Ext.Window({
                id: 'lvdashbrd', title: 'Leave Schedule Dashboard', width: 1000, height: 650, layout: 'border',resizable: false,
                items: [
                         {
                             region: 'west', width: 150, collapsible: true, frame: true, title: 'Leave Menu',
                             items: [
                                 {
                                     xtype: 'treepanel', id: 'PFprocesses', width: 'auto', height: 900,
                                     autoScroll: true, frame: true, border: true,
                                     root: {
                                         text: 'Leave Info Center', expanded: true,
                                         children: [
                                             {
                                                 text: 'Leave', id: 'prLeave', leaf: true,
                                                 listeners: {
                                                     'click': function (node) {
                                                         Ext.getCmp('PresenterPanel').layout.setActiveItem(0);
                                                     }
                                                 }
                                             },
                                             {
                                                 text: 'Application', id: 'lgout', leaf: true,
                                                 listeners: {
                                                     'click': function (node) {
                                                         Ext.getCmp('PresenterPanel').layout.setActiveItem(1);
                                                     }
                                                 }
                                             }
                                         ]
                                     }
                                 }
                             ]
                         },
                         {
                             region: 'center', width: 400,
                             items: [PresenterPanel]
                         },
                         {
                             region: 'north', height: 100, frame: true, height: 50, defaults: { xtype: 'form', frame: true },
                             listeners: {
                                 'afterrender': function () {
                                     $.getJSON('/Helper/getStaffName', {}, function (data) {
                                         Ext.getCmp('welcomeMsg').update({ name: data.surname.toString() + ' ' + data.othernames.toString() + ' (' + data.staffNumber.toString() + ' )' });
                                     });
                                 }
                             },
                             items: [
                                {
                                    tpl: new Ext.XTemplate(
                                        '<div>',
                                            '<b style="font-size:15px;">Welcome,</b><b style="color:green;font-size:18px;">&nbsp{name}</b>&nbsp&nbsp&nbsp',
                                        '</div>'
                                    ), id: 'welcomeMsg', compiled: true, data: { name: '', lastlogindate: '', logindate: '' }
                                }
                             ]
                         }
                ]
            }).show();

        }//end

    });

    
    
    /*
    new Ext.Viewport({
        layout: 'border', 
        items: [
            {
                region: 'west', width: 200,
                collapsible: true,
                items: [
                    {
                        xtype: 'treepanel',id: 'PFprocesses',width: 'auto',height: 900,
                        autoScroll: true, frame: true, border: true,
                        root: {
                            text: 'Staff Info Center', expanded: true,
                            children: [
                                {
                                    text: 'Leave', id: 'prLeave', leaf: true,
                                    listeners: {
                                        'click': function (node) {
                                            Ext.getCmp('PresenterPanel').layout.setActiveItem(0);
                                        }
                                    }
                                },
                                {
                                    text: 'Log Out', id: 'lgout', leaf: true,
                                    listeners: {
                                        'click': function (node) {
                                            Ext.MessageBox.confirm("Log Out?", "Are you sure you want to log out of the system?", function (btn) {
                                                if (btn == "yes") {
                                                    $.post('/User/SystemLogOut', {}, function (msg) {
                                                        //go back to login page regardless of whether operation was successful or not
                                                        window.location = "/";
                                                    }, "json");
                                                }
                                            });
                                        }
                                    }
                                }
                            ]
                        }
                    }
                ]
            },
            {
                region: 'center', width: 800,
                items: [PresenterPanel]
            },
            {
                region: 'north', frame: true, height: 50, defaults: { xtype: 'form', frame: true },
                listeners: {
                    'afterrender': function () {
                        $.getJSON('/Helper/getStaffName', {}, function (data) {
                            Ext.getCmp('welcomeMsg').update({ name: data.surname.toString() + ' ' + data.othernames.toString() + ' (' + data.staffNumber.toString() + ' )' });
                        });
                    }
                },
                items: [
                    {
                        tpl: new Ext.XTemplate(
                            '<div>',
                                '<b style="font-size:15px;">Welcome,</b><b style="color:green;font-size:18px;">&nbsp{name}</b>&nbsp&nbsp&nbsp',
                            '</div>'
                        ), id: 'welcomeMsg', compiled: true, data: { name: '', lastlogindate: '', logindate: '' }
                    }
                ]
            }
        ]
    });
    **/

});
Ext.onReady(function () {
    /*
    Ext.QuickTips.init();
    var xlsPic = "/Images/xls.jpg";
    var xlsPicx = "/Images/xlsx.jpg";
    var selectedRecord = 0;

    var getDaysLeft = function (st, df, dt) {
        
        if (st.length > 0 && df.length > 0 && dt.length > 0)
        {
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

    var getTotDays = function (sNo,nDays,nExtra,ctrl,stdte,retCtrl) {
        //compute the number of days
        var result = 0;
        if (sNo.length >0 && nDays.length > 0 && nExtra.length > 0) {
            result = (parseInt(nDays) + parseInt(nExtra));
            
            //determine resumption date
            $.getJSON('/Helper/determineResumptionDate',
                {startingDte:stdte,duration:result},
                function (msg) {
                    //Ext.Msg.alert("Resumption Date", msg.toString(), this);
                    retCtrl.setValue(msg.toString());
            });

            ctrl.setValue(result);
            //return result;
        }
    };


    new Ext.Viewport({
        layout: 'border',
        items: [
            {
                region: 'west', width: 150, collapsible: true,
                items: [
                   {
                       xtype: 'treepanel',id: 'PFprocesses',width: 'auto',height: 900,autoScroll: true,
                       frame: true, border: true,
                       root: {
                           text: 'Configuration', expanded: true,
                           children: [
                               {
                                   text: 'Log out', leaf: true, id: 'lgout',
                                   listeners: {
                                       'click': function (node) {
                                           Ext.MessageBox.confirm("Log out?", "Are you sure you want to log out of the system?", function (btn) {
                                               if (btn == "yes") {
                                                   $.post('/User/SystemLogOut', {}, function (msg) {
                                                       //log out irrespective of the outcome of this operation
                                                       console.info("logout status: " + msg.toString());
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
                region: 'center', height: 800, defaults: { xtype: 'tabpanel' },
                items: [
                    {
                        deferredRender: true, activeTab: 0, frame: true, height: 600, width: 'auto', defaults: { xtype: 'form', frame: true, border: true },
                        items: [
                            {
                                xtype: 'panel', title: 'Leave Module', tabTip: 'deals with staff data module', defaults: { xtype: 'form', frame: true, border: true }, layout: 'accordion',
                                items: [
                                    {
                                        xtype: 'panel', title: 'Upload Staff Data::Used once in the lifetime of the system', layout: 'column', defaults: { xtype: 'form', frame: true, border: true },
                                        items: [
                                            {
                                                xtype: 'panel', columnWidth: .1, layout: 'column', defaults: { xtype: 'form', frame: true },
                                                items: [
                                                    {
                                                        title: 'staff template', frame: false,
                                                        tpl: new Ext.XTemplate(
                                                             '<div style="max-width:150px;max-height:100%;">',
                                                             '<a href="{h}"><img id="natim" src="{urlpath}" alt="{alternative}"></a>',
                                                             '</div>'
                                                         ),
                                                        id: 'stfdta', compiled: true, data: { alternative: 'Junior Staff', urlpath: xlsPicx, h: '/Uploads/Staff.xls' }, autoScroll: true
                                                    }
                                                ]
                                            },
                                            {
                                                xtype: 'panel', id: 'frmstfUpload', title: 'data upload', columnWidth: .3, fileUpload: true, defaults: { allowBlank: false, msgTarget: 'side' },
                                                bodyStyle: 'padding: 10px 10px 10px 10px;',
                                                listeners: {
                                                    'afterrender': function () {
                                                        this.load({ url: '/LeaveScheduler/StaffUploadSchedule', scripts: true });
                                                    }
                                                }
                                            },
                                            {
                                                id: 'xf', columnWidth: .6,
                                                items: [
                                                    new Ext.grid.GridPanel({
                                                        id: 'stgrd', title: 'Update Staff Information', height: 430, autoScroll: true,
                                                        store: new Ext.data.GroupingStore({
                                                            reader: new Ext.data.ArrayReader({}, [
                                                                { name: 'Id', type: 'int' },
                                                                { name: 'staffNo', type: 'string' },
                                                                { name: 'surname', type: 'string' },
                                                                { name: 'othernames', type: 'string' },
                                                                { name: 'salutation', type: 'string' },
                                                                { name: 'department', type: 'string' },
                                                            ]), sortInfo: { field: 'staffNo', direction: 'ASC' }, groupField: 'department'
                                                        }),
                                                        columns: [
                                                            { id: 'Id', header: 'ID', hidden: true, width: 40, sortable: true, dataIndex: 'Id' },
                                                            { id: 'staffNumber', header: 'Staff No', hidden: false, width: 80, sortable: true, dataIndex: 'staffNo' },
                                                            { id: 'surname', header: 'Surname', hidden: false, width: 80, sortable: true, dataIndex: 'surname' },
                                                            { id: 'othernames', header: 'Others', hidden: false, width: 80, sortable: true, dataIndex: 'othernames' },
                                                            { id: 'salutation', header: 'Salutation', hidden: true, width: 80, sortable: true, dataIndex: 'salutation' },
                                                            { id: 'department', header: 'Department', hidden: true, width: 80, sortable: true, dataIndex: 'department' }
                                                        ], stripeRows: true, autoExpandColumn: 'staffNumber',
                                                        view: new Ext.grid.GroupingView({
                                                            forceFit: true,
                                                            groupTextTpl: '{text} ({[values.rs.length]} {[values.rs.length > 1 ? "Items" : "Item"]})',
                                                            getRowClass: function (record, index) {
                                                                var c = record;
                                                                if ((index % 1) > 0) {
                                                                    return 'odd';
                                                                } else { return 'even'; }
                                                            }
                                                        }),
                                                        frame: true, collapsible: true, animCollapse: false, iconCls: 'icon-grid',
                                                        listeners: {
                                                            'afterrender': function () {

                                                                var getData = function () {
                                                                    var queryFilter = '*';
                                                                    $.getJSON('/Helper/getStaffDetailsByCategory',
                                                                    { sCategory: queryFilter }, function (dta) {
                                                                        var ar = new Array(); var i = 0;
                                                                        Ext.each(dta.msg, function (item) {
                                                                            ar[i] = [item.Id, item.staffNo, item.surname, item.othernames, item.salutation, item.department];
                                                                            i++;
                                                                        });

                                                                        Ext.getCmp('stgrd').getStore().removeAll();
                                                                        Ext.getCmp('stgrd').getStore().loadData(ar);
                                                                    })
                                                                };
                                                                setInterval(getData, 30000);
                                                            }
                                                        }
                                                    })
                                                ]
                                            }
                                        ]
                                    },
                                    {
                                        xtype: 'panel', title: 'Staff and Leave Data Entry', defaults: { xtype: 'form', frame: true, border: true }, layout: 'column',
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
                                    {
                                        xtype: 'panel', title: 'Upload Leave Schedule', layout: 'column', defaults: { xtype: 'form', frame: true, border: true },
                                        items: [
                                            {
                                                xtype: 'panel', columnWidth: .1, layout: 'column', defaults: { xtype: 'form', frame: true },
                                                items: [
                                                    {
                                                        title: 'leave template', frame: false, tpl: new Ext.XTemplate(
                                                             '<div style="max-width:150px;max-height:100%;">',
                                                             '<a href="{h}"><img id="natim" src="{urlpath}" alt="{alternative}"></a>',
                                                             '</div>'
                                                         ),
                                                        id: 'jnr', compiled: true, data: { alternative: 'Junior Staff', urlpath: xlsPicx, h: '/Uploads/Schedule.xls' }, autoScroll: true
                                                    }
                                                ]
                                            },
                                            {
                                                xtype: 'panel', id: 'frmUpload', title: 'data upload', columnWidth: .3, fileUpload: true, defaults: { allowBlank: false, msgTarget: 'side' },
                                                bodyStyle: 'padding: 10px 10px 10px 10px;',
                                                listeners: {
                                                    'afterrender': function () {
                                                        this.load({ url: '/LeaveScheduler/LeaveScheduleUpload', scripts: true });
                                                    }
                                                }
                                            },
                                            {
                                                columnWidth: .6,
                                                listeners: {
                                                    'afterrender': function () {
                                                        setInterval(getScheduleData,60000);
                                                    }
                                                },
                                                items: [
                                                    new Ext.grid.GridPanel({
                                                        id: 'lvgrd', height: 400,title: 'Staff Leave Info',
                                                        store: new Ext.data.GroupingStore({
                                                            autoLoad: true, restful: true, url: '/Helper/getScheduleData', baseParams: {strParam: '*'},
                                                            reader: new Ext.data.JsonReader({}, [
                                                                { name: 'LId', type: 'int' },
                                                                { name: 'StaffName', type: 'string' },
                                                                { name: 'departmentName', type: 'string' },
                                                                { name: 'startingDate', type: 'string' },
                                                                { name: 'endingDate', type: 'string' },
                                                                { name: 'entitledDays', type: 'int' },
                                                                { name: 'travelDays', type: 'int' },
                                                                { name: 'totalLeaveDays', type: 'int' }
                                                            ]), sortInfo: { field: 'LId', direction: 'ASC' }, groupField: 'departmentName'
                                                        }),
                                                        columns: [
                                                            { id: 'LId', header: 'ID', hidden: true, width: 40, sortable: true, dataIndex: 'LId' },
                                                            { id: 'StaffName', header: 'STAFF', hidden: false, width: 70, sortable: true, dataIndex: 'StaffName' },
                                                            { id: 'departmentName', header: 'DEPARTMENT', hidden: true, width: 40, sortable: true, dataIndex: 'departmentName' },
                                                            { id: 'startingDate', header: 'DATE FROM', hidden: false, width: 35, sortable: true, dataIndex: 'startingDate' },
                                                            { id: 'endingDate', header: 'DATE TO', hidden: false, width: 35, sortable: true, dataIndex: 'endingDate' },
                                                            { id: 'entitledDays', header: 'LEAVE DAYS', hidden: false, width: 30, sortable: true, dataIndex: 'entitledDays' },
                                                            { id: 'travelDays', header: 'TRAVEL DAYS', hidden: false, width: 30, sortable: true, dataIndex: 'travelDays' },
                                                            { id: 'totalLeaveDays', header: 'TOTAL DAYS', hidden: false, width: 40, sortable: true, dataIndex: 'totalLeaveDays' },
                                                        ], stripeRows: true, autoExpandColumn: 'StaffName',
                                                        view: new Ext.grid.GroupingView({
                                                            forceFit: true,
                                                            groupTextTpl: '{text} ({[values.rs.length]} {[values.rs.length > 1 ? "Items" : "Item"]})',
                                                            getRowClass: function (record, index) {
                                                                if ((index % 1) > 0) {
                                                                    return 'odd';
                                                                } else { return 'even'; }
                                                            }
                                                        }), frame: true, collapsible: true,animCollapse: true,iconCls: 'icon-grid'
                                                    })
                                                ]
                                            }
                                        ]
                                    },
                                    {
                                        title: 'Holidays Module', xtype: 'panel', defaults: { xtype: 'form', frame: true, border: true }, layout: 'column',
                                        items: [
                                            {
                                                id: 'holidayFrm', title: 'Enter Holidays Record', columnWidth: .5, defaults: { xtype: 'datefield', allowBlank: false, anchor: '70%' },
                                                items: [
                                                    { id: 'hdy', fieldLabel: 'Enter Holiday', listeners: { 'afterrender': function () { $('#hdy').attr('readonly', true); } } },
                                                    { xtype: 'textarea', id: 'hdesc', fieldLabel: 'Description', allowBlank: true, emptyText: 'enter description of holiday', allowBlank: false },
                                                    {
                                                        xtype: 'button', text: 'Save',
                                                        handler: function (btn) {
                                                            var hFrm = Ext.getCmp('holidayFrm').getForm();
                                                            if (hFrm.isValid()) {
                                                                $.post('/LeaveScheduler/SaveHolidayRecord',
                                                                    { hdate: Ext.fly('hdy').getValue(), hdesc: Ext.fly('hdesc').getValue() },
                                                                    function (msg) {
                                                                        if (msg.status.toString() == "true") {
                                                                            hFrm.reset();
                                                                        }
                                                                    }, "json");
                                                            }
                                                            else { Ext.Msg.alert("LEAVE SCHEDULER", "Please enter all required fields", this); }
                                                        }
                                                    }
                                                ]
                                            },
                                            {
                                                title: 'Holidays Information', columnWidth: .5,
                                                listeners: {
                                                    'afterrender': function () {
                                                        var getHolidays = function () {
                                                            $.getJSON('/Helper/getHolidaysInfo', {}, function (msg) {
                                                                var dta = []; var knt = 0;
                                                                Ext.each(msg.msg, function (item) {
                                                                    dta[knt] = [item.Id, item.dateOfholiday, item.description];
                                                                    knt++;
                                                                });
                                                                console.log(msg);
                                                                Ext.getCmp('hgrd').getStore().removeAll();
                                                                Ext.getCmp('hgrd').getStore().load(msg);
                                                            });

                                                        }
                                                        
                                                        setInterval(getHolidays, 30000);
                                                    }
                                                },
                                                items: [
                                                    new Ext.grid.GridPanel({
                                                        id: 'hgrd', height: 300,
                                                        store: new Ext.data.Store({
                                                            autoLoad: true, restful: true, url: '/Helper/getHolidaysInfo', baseParams: {},
                                                            reader: new Ext.data.JsonReader({}, [
                                                                { name: 'Id', type: 'int' },
                                                                { name: 'dateOfholiday', type: 'string' },
                                                                { name: 'description', type: 'string' }
                                                            ])
                                                        }),
                                                        columns: [
                                                            { id: 'Id', header: 'ID', width: 40, hidden: true, sortable: true, dataIndex: 'Id' },
                                                            { id: 'dateOfholiday', header: 'HOLIDAY', width: 100, hidden: false, sortable: true, dataIndex: 'dateOfholiday' },
                                                            { id: 'description', header: 'DESCRIPTION', width: 120, hidden: false, sortable: true, dataIndex: 'description' }
                                                        ], stripeRows: true, autoExpandColumn: 'dateOfholiday', viewConfig: {
                                                            forceFit: true,
                                                            getRowClass: function (record, index) {
                                                                if ((index % 1) > 0) {
                                                                    return 'odd';
                                                                } else { return 'even'; }
                                                            }
                                                        }
                                                    })
                                                ]
                                            }
                                        ]
                                    },
                                    {
                                        title: 'Leave Application Module::Used when staff applies for leave', xtype: 'panel', defaults: { xtype: 'form', frame: true, border: true }, layout: 'column',
                                        items: [
                                            {
                                                xtype: 'panel',title: 'Application', columnWidth: .5, defaults: { xtype: 'form', frame: true, border: true },
                                                items: [
                                                     {
                                                         title: 'Search', layout: 'column', defaults: { xtype: 'textfield', anchor: '60%', allowBlank: false },
                                                         items: [
                                                             {
                                                                 xtype: 'textfield', id: 'snum', fieldLabel: 'Staff No',emptyText: 'enter staff No', columnWidth: .3
                                                             },
                                                             {
                                                                 xtype: 'button', text: 'Search for Staff', columnWidth: .2,
                                                                 handler: function (btn) {
                                                                     $.getJSON('/Helper/getSnapshot', { stNo: Ext.fly('snum').getValue() }, function (msg) {
                                                                         Ext.getCmp('scontrol').update({ldata: msg.totalLeaveDays.toString(), adata: msg.accumulatedDays.toString(), availdata: msg.availableDays.toString() });
                                                                     });
                                                                     $.getJSON('/Helper/getLeaveHistory',
                                                                         { staffNo: Ext.fly('snum').getValue() },
                                                                         function (dta) {
                                                                             var data = []; var i = 0;
                                                                             Ext.each(dta, function (item) {
                                                                                 data[i] = [item.LId, item.startingDate, item.endingDate, item.leavetype, item.entitledDays,item.travelDays];
                                                                                 i++;
                                                                             });
                                                                             
                                                                             Ext.getCmp('histgrd').getStore().removeAll();
                                                                             Ext.getCmp('histgrd').getStore().loadData(data);
                                                                         });
                                                                 }
                                                             }
                                                         ]
                                                     },
                                                     {
                                                         id: 'applFrm',title: 'application', defaults: { xtype: 'numberfield', anchor: '60%', allowBlank: false },
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
                                                                        getTotDays(Ext.fly('snum').getValue(), Ext.fly('dtk').getValue(), Ext.fly('xday').getValue(), Ext.getCmp('totd'), Ext.fly('std').getValue(),Ext.getCmp('resumpDte'));
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
                                                                 text: 'Save',
                                                                 handler: function (btn) {
                                                                     Ext.MessageBox.confirm("Continue?", "This action will save leave record.Do you want to continue?", function (btn) {
                                                                         if (btn == "yes") {
                                                                             var appF = Ext.getCmp('applFrm').getForm();
                                                                             if (appF.isValid() && (Ext.fly('snum').getValue().length > 0)) {
                                                                                 $.post('/LeaveScheduler/SaveLeaveHistory',
                                                                                     {
                                                                                         sNo: Ext.fly('snum').getValue(),sdte: Ext.fly('std').getValue(),edte: Ext.fly('resumpDte').getValue(),
                                                                                         Ltype:Ext.fly('ltyps').getValue(),days:Ext.fly('dtk').getValue(),xtra:Ext.fly('xday').getValue(),
                                                                                         tot: Ext.fly('totd').getValue()
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
                                                                                         
                                                                                 },"json");
                                                                             }
                                                                         } else { console.log('do nothing'); }
                                                                     });
                                                                 }
                                                             }
                                                         ]
                                                     }
                                                ]
                                            },
                                            {
                                                xtype: 'panel',title: 'Leave History', defaults: { xtype: 'form', frame: true, border: true }, columnWidth: .5, layout: 'form',height:400,
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
                                                                ),id: 'scontrol',compiled: true, data: {ldata: '', adata: '', availdata: '' }
                                                            }
                                                        ]
                                                    },
                                                    {
                                                        title: 'History', height: 230,
                                                        items: [
                                                            new Ext.grid.GridPanel({
                                                                id: 'histgrd', height: 200,autoScroll: true,
                                                                store: new Ext.data.ArrayStore({
                                                                    fields: [
                                                                        { name: 'LId', type: 'long' },
                                                                        { name: 'startingDate', type: 'string' },
                                                                        { name: 'endingDate', type: 'string' },
                                                                        { name: 'leavetype', type: 'string' },
                                                                        { name: 'entitledDays', type: 'int' },
                                                                        { name: 'travelDays', type: 'int' }
                                                                    ]
                                                                }),
                                                                columns: [
                                                                    { id: 'LId', header: 'ID', width: 40, sortable: true, hidden: true, dataIndex: 'LId' },
                                                                    { id: 'startingDate', header: 'STARTING DATE', width: 100, sortable: true, hidden: false, dataIndex: 'startingDate' },
                                                                    { id: 'endingDate', header: 'ENDING DATE', width: 100, sortable: true, hidden: false, dataIndex: 'endingDate' },
                                                                    { id: 'leavetype', header: 'LEAVE TYPE', width: 100, sortable: true, hidden: false, dataIndex: 'leavetype' },
                                                                    { id: 'entitledDays', header: 'DAYS TAKEN', width: 70, sortable: true, hidden: false, dataIndex: 'entitledDays' },
                                                                    { id: 'travelDays', header: 'EXTRA', width: 70, sortable: true, hidden: false, dataIndex: 'travelDays' }
                                                                ], stripeRows: true, autoExpandColumn: 'startingDate',
                                                                viewConfig: {
                                                                    forceFit: true,
                                                                    getRowClass: function (record, index) {
                                                                        if ((index % 1) > 0) {
                                                                            return 'even';
                                                                        } else { return 'odd'; }
                                                                    }
                                                                },
                                                                listeners: {
                                                                    'rowclick': function (grid,rowIndex,e) {
                                                                        selectedRecord = grid.getStore().getAt(rowIndex);
                                                                        console.log(selectedRecord);
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
                            }
                        ]
                    }
                ]
            }
        ]
    });
    */
});
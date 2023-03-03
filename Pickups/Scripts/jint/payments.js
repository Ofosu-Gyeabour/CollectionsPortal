Ext.onReady(function () {

    var deptId = 1;
    Ext.get('acc-win-payments').on('click', function (e, t) {

        var gen = function (startd, apprd, amount, duration) {

            if (startd != '' && amount != '' && duration != '') {
                if (startd > apprd) 
                {
                    $.getJSON('/Utility/getPaymentSchedule',
                    { startingdate: Ext.fly('effdte').getValue(), amt: Ext.fly('amt').getValue(), period: Ext.fly('duration').getValue(), intrate: Ext.fly('intrate').getValue() },
                    function (msg) {
                        var arr = [];
                        $.each(msg, function (i, obj) {
                            arr[i] = [obj.Id, obj.paymentdate, obj.principal, obj.interest, obj.payment, obj.totalPayment, obj.balanceLeft];
                        });

                        Ext.getCmp('landSchedule').getStore().removeAll();
                        Ext.getCmp('landSchedule').getStore().loadData(arr);
                    });
                }
            }
        };

        var loadStaffList = function () {
            var myMask = new Ext.LoadMask(Ext.getCmp('grdPaid').el, { useMsg: false });
            myMask.show();
            var grdDta = new Array();
            $.getJSON('/Utility/getStaffList', {}, function (msg) {
                $.each(msg, function (i, item) {
                    grdDta[i] = [item.Id, item.staffId, item.surname, item.firstname, item.othernames, item.accountNo, item.nameOfdepartment, item.gender, item.corporateEmail, item.alternateEmail, item.postalAddress, item.residentialAddress, item.alternateAccountNo];
                });

                //console.log(paidtot);
                Ext.getCmp('grdPaid').getStore().removeAll();
                Ext.getCmp('grdPaid').getStore().loadData(grdDta);
                //Ext.getCmp('paidtotamt').update({ totno: paidtot.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") });
                Ext.getCmp('paidtotamt').update({ totno: Ext.getCmp('grdPaid').getStore().getCount() });
                myMask.hide();
            });
        };


        var win = Ext.getCmp('payWin');
        if (!win) {
            new Ext.Window({
                id: 'vwSalary', title: 'STAFF APPLICATIONS', height: 615, width: 1050, defaults: { xtype: 'panel', height: '100%' },
                resizable: false, layout: 'border',
                items: [
                {
                    region: 'west', title: 'PROCESSES', width: '20%', height: 615, collapsible: true, defaults: { xtype: 'tabpanel' },
                    items: [
                        {
                            xtype: 'treepanel', id: 'searchpanel', width: 'auto', height: '100%', autoScroll: true, frame: true, border: true,
                            root: {
                                text: 'NIBSSA',
                                expanded: true,
                                children: [
                                    {
                                        text: 'Applications',
                                        expanded: true,
                                        children: [
                                            {
                                                text: 'Land', leaf: true,
                                                listeners: {
                                                    'click': function () {
                                                        Ext.getCmp('mainmnu').layout.setActiveItem(0);
                                                    }
                                                }
                                            }
                                        ]
                                    },
                                    {
                                        text: 'Enrollments',
                                        expanded: true,
                                        children: [
                                            {
                                                text: 'Staff Records', leaf: true,
                                                listeners: {
                                                    'click': function () {
                                                        Ext.getCmp('mainmnu').layout.setActiveItem(1);
                                                    }
                                                }
                                            }
                                        ]
                                    },
                                    {
                                        text: 'Payments', expanded: true,
                                        children: [
                                            {
                                                text: 'Land Payments', leaf: true,
                                                listeners: {
                                                    'click': function () {
                                                        Ext.getCmp('mainmnu').layout.setActiveItem(2);
                                                    }
                                                }
                                            }
                                        ]
                                    }
                                ]
                            }
                        },

                        {
                            xtype: 'tabpanel', id: '', deferredRender: true, activeTab: 0, frame: true, height: 300, width: 'auto', defaults: { xtype: 'xtemplate', frame: true },
                            items: [
                                {
                                    xtype: 'panel', title: 'Statistics', tabTip: 'general statistics',
                                    items: [
                                       {
                                           tpl: new Ext.XTemplate(
                                                '<div style="max-width:1000px;max-height:100%;">',
                                                    '<b style="font-size:12px;">Union Loans:</b>&nbsp&nbsp<strong><b style="color:green;font-size:12px;">GHS&nbsp{PF}</b></strong>',
                                                '</div><br>',

                                                '<div style="max-width:340px;max-height:100%;">',
                                                    '<b style="font-size:12px;">Land Payments:</b>&nbsp&nbsp<strong><b style="color:green;font-size:12px;">GHS&nbsp{salary}</b></strong>',
                                                '</div><br>',

                                                '<div style="max-width:340px;max-height:100%;">',
                                                    '<b style="font-size:12px;">Total Loans:</b>&nbsp&nbsp<strong><b style="color:green;font-size:12px;">GHS&nbsp{totLoans}</b></strong>',
                                                '</div><br>'
                                            ),
                                           id: 'lscheduleDta', compiled: true, data: { PF: '0.00', salary: '0.00', allowances: '0.00', totLoans: '0.00' }
                                       }
                                    ]
                                },
                                {
                                    xtype: 'panel', title: 'Graph', tabTip: 'graphs'
                                }
                             ]
                        }

                    ]
                },
                    {
                        id: 'mainmnu', region: 'center', width: '100%', collapsible: false,
                        defaults: { xtype: 'panel', frame: true, collapsible: true }, layout: 'card', autoScroll: true, activeItem: 0,
                        items: [
                            {
                                id: '', title: 'Loan Application', defaults: { xtype: 'form', frame: true, border: true }, layout: 'column',
                                items: [
                                    {
                                        id: '', title: 'calculator', columnWidth: .4, defaults: { xtype: 'textfield', anchor: '90%', allowBlank: false }, collapsible: true,
                                        items: [
                                            { id: 'sNo', fieldLabel: 'Staff No', emptyText: 'staff No', listeners: { 'blur': function () { gen(Ext.fly('effdte').getValue(), Ext.fly('aprdte').getValue(), Ext.fly('amt').getValue(), Ext.fly('duration').getValue()) } } },
                                            {
                                                xtype: 'numberfield', id: 'amt', fieldLabel: 'Amount',
                                                listeners: {
                                                    'blur': function () {
                                                        gen(Ext.fly('effdte').getValue(), Ext.fly('aprdte').getValue(), Ext.fly('amt').getValue(), Ext.fly('duration').getValue())
                                                    }
                                                }
                                            },
                                            {
                                                xtype: 'numberfield', id: 'duration', fieldLabel: 'Duration',
                                                listeners: {
                                                    'blur': function () {
                                                        gen(Ext.fly('effdte').getValue(), Ext.fly('aprdte').getValue(), Ext.fly('amt').getValue(), Ext.fly('duration').getValue())
                                                    }
                                                }
                                            },
                                            { xtype: 'combo', id: 'ptyp', fieldLabel: 'Payment Type', mode: 'local', store: ['Straight Line'], forceSelection: true, typeAhead: true, width: '20%' },
                                            { xtype: 'combo', id: 'ltyp', fieldLabel: 'Loan Type', mode: 'local', store: ['Union Loan', 'Land'], forceSelection: true, typeAhead: true, width: '20%' },
                                            { xtype: 'numberfield', id: 'intrate', fieldLabel: 'Interest Rate', emptyText: 'interest rate' },
                                            {
                                                xtype: 'datefield', id: 'aprdte', fieldLabel: 'Date Approved', width: '100%',
                                                listeners: {
                                                    'blur': function () {
                                                        gen(Ext.fly('effdte').getValue(), Ext.fly('aprdte').getValue(), Ext.fly('amt').getValue(), Ext.fly('duration').getValue())
                                                    }
                                                }
                                            },
                                            {
                                                xtype: 'datefield', id: 'effdte', fieldLabel: 'Effective Date', width: '100%',
                                                listeners: {
                                                    'blur': function () {
                                                        gen(Ext.fly('effdte').getValue(), Ext.fly('aprdte').getValue(), Ext.fly('amt').getValue(), Ext.fly('duration').getValue())
                                                    }
                                                }
                                            },
                                            {
                                                xtype: 'combo', id: 'apprby', fieldLabel: 'Approved By', mode: 'local', width: '20%',
                                                store: new Ext.data.Store({
                                                    autoLoad: true, restful: true, url: '/Utility/getUserList',
                                                    reader: new Ext.data.JsonReader({}, [
                                                        { name: 'userId', type: 'int' },
                                                        { name: 'username', type: 'string' }
                                                    ])
                                                }), valueField: 'userId', displayField: 'username', forceSelection: true, typeAhead: true,
                                                listeners: {
                                                    'blur': function () {
                                                        gen(Ext.fly('effdte').getValue(), Ext.fly('aprdte').getValue(), Ext.fly('amt').getValue(), Ext.fly('duration').getValue())
                                                    }
                                                }
                                            },
                                            {
                                                id: 'ref', fieldLabel: 'Ref No', emptyText: 'loan reference no',
                                                listeners: {
                                                    'blur': function () {
                                                        gen(Ext.fly('effdte').getValue(), Ext.fly('aprdte').getValue(), Ext.fly('amt').getValue(), Ext.fly('duration').getValue())
                                                    }
                                                }
                                            }
                                        ]
                                    },
                                    {
                                        xtype: 'panel', title: 'Payment Schedule', columnWidth: .6, height: 500, collapsible: true, defaults: { xtype: 'form' },
                                        items: [
                                            {
                                                id: '', title: '',
                                                items: [
                                                    new Ext.grid.GridPanel({
                                                        id: 'landSchedule', width: '100%', height: 400,
                                                        store: new Ext.data.Store({
                                                            reader: new Ext.data.ArrayReader({}, [
                                                                { name: 'Id', type: 'int' },
                                                                { name: 'paymentdate', type: 'string' },
                                                                { name: 'principal', type: 'float' },
                                                                { name: 'interest', type: 'float' },
                                                                { name: 'payment', type: 'float' },
                                                                { name: 'totalPayment', type: 'float' },
                                                                { name: 'balanceLeft', type: 'float' }
                                                            ])
                                                        }),
                                                        columns: [
                                                            { id: 'Id', header: 'ID', hidden: true, width: 40, sortable: true, dataIndex: 'Id' },
                                                            { id: 'paymentdate', header: 'PAYMENT DATE', hidden: false, width: 40, sortable: true, dataIndex: 'paymentdate' },
                                                            { id: 'principal', header: 'PRINCIPAL', hidden: false, width: 40, sortable: true, dataIndex: 'principal' },
                                                            { id: 'interest', header: 'INTEREST', hidden: false, width: 40, sortable: true, dataIndex: 'interest' },
                                                            { id: 'payment', header: 'MONTHLY PAYMENT', hidden: false, width: 40, sortable: true, dataIndex: 'payment' },
                                                            { id: 'totalPayment', header: 'TOTAL PAYMENT', hidden: false, width: 40, sortable: true, dataIndex: 'totalPayment' },
                                                            { id: 'balanceLeft', header: 'OUTSTANDING', hidden: false, width: 40, sortable: true, dataIndex: 'balanceLeft' },
                                                        ], stripeRows: true, autoExpandColumn: 'paymentdate', viewConfig: { forceFit: true }, autoScroll: true
                                                    })
                                                ]
                                            },
                                            {
                                                xtype: 'panel',
                                                items: [
                                                    {
                                                        tpl: new Ext.XTemplate(
                                                            '<a id="rptPaid" style="display:none" href="{path}">Payment Advice (PDF)</a>'
                                                        ), compiled: true, data: { path: '/Report/generatePaymentSchedule' }, autoScroll: true
                                                    },
                                                    {
                                                        tpl: new Ext.XTemplate(
                                                            '<a id="rptXL" style="display:none" href="{path}">Payment Advice (xlsx)</a>'
                                                        ), compiled: true, data: { path: '/Report/generatePaymentScheduleExcel' }, autoScroll: true
                                                    }
                                                ]
                                            },
                                            {
                                                buttons: [
                                                    {
                                                        text: 'Generate Schedule (PDF)',
                                                        handler: function (btn) {
                                                            if (Ext.getCmp('landSchedule').getStore().getCount() > 0) {
                                                                window.open(document.getElementById('rptPaid').href, '_blank');
                                                            }
                                                        }
                                                    },
                                                    {
                                                        text: 'Generate Schedule(xlsx)',
                                                        handler: function (btn) {
                                                            if (Ext.getCmp('landSchedule').getStore().getCount() > 0) {
                                                                window.open(document.getElementById('rptXL').href, '_blank');
                                                            }
                                                        }
                                                    },
                                                    {
                                                        text: 'Save Schedule',
                                                        handler: function () {
                                                            if (Ext.getCmp('landSchedule').getStore().getCount() > 0) {

                                                                $.post('/Schedule/StoreSchedule',
                                                                {
                                                                    sNo: Ext.fly('sNo').getValue(), amt: Ext.fly('amt').getValue(), period: Ext.fly('duration').getValue(),
                                                                    intrate: Ext.fly('intrate').getValue(), dtAppr: Ext.fly('aprdte').getValue(), effDte: Ext.fly('effdte').getValue(),
                                                                    apprby: Ext.fly('apprby').getValue(), refNo: Ext.fly('ref').getValue(), ltype: Ext.fly('ltyp').getValue()
                                                                },
                                                                function (msg) {
                                                                    if (msg.failed.toString() == "0") {
                                                                        Ext.Msg.alert("SCHEDULE SAVED", "Loan Schedule saved successfully", this);
                                                                    }
                                                                    else { Ext.Msg.alert("SCHEDULE STATUS", "An error occured.Please contact administrator", this); }
                                                                }, "json");
                                                            }
                                                        }
                                                    }
                                                ]
                                            }
                                        ]
                                    }
                                ]
                            },
                            {
                                id: '', title: 'Staff Records', defaults: { xtype: 'form', frame: true, border: true }, layout: 'column',
                                items: [
                                    {
                                        id: 'frmEditStaff', title: 'Edit Staff Record', columnWidth: .4, defaults: { xtype: 'textfield', anchor: '90%', allowBlank: false }, collapsible: true,
                                        items: [
                                            { id: 'stNo', fieldLabel: 'Staff No' },
                                            { id: 'sname', fieldLabel: 'Surname' },
                                            { id: 'fname', fieldLabel: 'Firstname' },
                                            { id: 'onames', fieldLabel: 'Other names', allowBlank: true },
                                            {
                                                xtype: 'combo', id: 'depmt', fieldLabel: 'Department', mode: 'local',
                                                store: new Ext.data.Store({
                                                    autoLoad: true, restful: true, url: '/Utility/getDepartments',
                                                    reader: new Ext.data.JsonReader({}, [
                                                        { name: 'Id', type: 'int' },
                                                        { name: 'nameOfdepartment', type: 'string' }
                                                    ])
                                                }),
                                                valueField: 'Id', displayField: 'nameOfdepartment', typeAhead: true, allowBlank: false, forceSelection: true,
                                                listeners: {
                                                    'change': function () {
                                                        deptId = Ext.getCmp('depmt').getValue();
                                                        console.log(id);
                                                    },
                                                    'blur': function () {
                                                        deptId = Ext.getCmp('depmt').getValue();
                                                        console.log(id);
                                                    }
                                                }
                                            },
                                            { xtype: 'combo', id: 'gender', fieldLabel: 'Gender', mode: 'local', store: ['Male', 'Female'], typeAhead: true, allowBlank: false, forceSelection: true },
                                            { id: 'corpemail', fieldLabel: 'Corporate email', allowBlank: true },
                                            { id: 'altemail', fieldLabel: 'Alternate email', allowBlank: true },
                                            { id: 'postAdr', fieldLabel: 'Postal Address', allowBlank: true },
                                            { id: 'resAdr', fieldLabel: 'Res. Address', allowBlank: true },
                                            { id: 'accNom', fieldLabel: 'Univbank Acc No' },
                                            { id: 'altaccNom', fieldLabel: 't24 Acc No', allowBlank: true }
                                        ],
                                        buttons: [
                                            {
                                                text: 'Save',
                                                listeners: {
                                                    'click': function (btn) {
                                                        var editFrm = Ext.getCmp('frmEditStaff').getForm();

                                                        if (editFrm.isValid()) {

                                                            $.post('/Utility/updateStaffData',
                                                            {
                                                                sNo: Ext.fly('stNo').getValue(), sn: Ext.fly('sname').getValue(), fn: Ext.fly('fname').getValue(), oname: Ext.fly('onames').getValue(),
                                                                dep: Ext.fly('depmt').getValue(), depId: deptId, sex: Ext.fly('gender').getValue(), cem: Ext.fly('corpemail').getValue(), altem: Ext.fly('altemail').getValue(),
                                                                pAdr: Ext.fly('postAdr').getValue(), rAdr: Ext.fly('resAdr').getValue(), acc: Ext.fly('accNom').getValue(), altacc: Ext.fly('altaccNom').getValue()
                                                            },
                                                            function (msg) {
                                                                if (msg.status.toString() == "true") { loadStaffList(); }
                                                            }, "json");
                                                        }
                                                        else { Ext.Msg.alert('Missing values', 'Please enter the missing values', this); }
                                                    }
                                                }
                                            },
                                            {
                                                text: 'Clear',
                                                handler: function (btn) {
                                                    Ext.getCmp('frmEditStaff').getForm().reset();
                                                }
                                            }
                                        ]
                                    },
                                    {
                                        id: '', title: 'Staff Record List', columnWidth: .6,
                                        items: [
                                            new Ext.grid.GridPanel({
                                                id: 'grdPaid', height: 400, autoScroll: true,
                                                store: new Ext.data.GroupingStore({
                                                    //autoLoad: true, restful: true, url: '',
                                                    reader: new Ext.data.ArrayReader({}, [
                                                                { name: 'Id', type: 'int' },
                                                                { name: 'staffId', type: 'string' },
                                                                { name: 'surname', type: 'string' },
                                                                { name: 'firstname', type: 'string' },
                                                                { name: 'othernames', type: 'string' },
                                                                { name: 'accountNo', type: 'string' },
                                                                { name: 'nameOfdepartment', type: 'string' },
                                                                { name: 'gender', type: 'string' },
                                                                { name: 'corporateEmail', type: 'string' },
                                                                { name: 'alternateEmail', type: 'string' },
                                                                { name: 'postalAddress', type: 'string' },
                                                                { name: 'residentialAddress', type: 'string' },
                                                                { name: 'alternateAccountNo', type: 'string' }
                                                            ]), sortInfo: { field: 'Id', direction: 'ASC' }, groupField: 'nameOfdepartment'
                                                }),
                                                columns: [
                                                    { id: 'Id', header: 'ID', width: 40, hidden: true, sortable: true, dataIndex: 'Id' },
                                                    { id: 'staffId', header: 'STAFF No', width: 100, hidden: false, sortable: true, dataIndex: 'staffId' },
                                                    { id: 'surname', header: 'SURNAME', width: 120, hidden: false, sortable: true, dataIndex: 'surname' },
                                                    { id: 'firstname', header: 'FIRSTNAME', width: 150, hidden: false, sortable: true, dataIndex: 'firstname' },
                                                    { id: 'othernames', header: 'OTHER NAMES', width: 40, hidden: true, sortable: false, dataIndex: 'othernames' },
                                                    { id: 'accountNo', header: 'ACC', width: 60, hidden: false, sortable: true, dataIndex: 'accountNo' },
                                                    { id: 'nameOfdepartment', header: 'DEPARTMENT', width: 60, hidden: true, sortable: true, dataIndex: 'nameOfdepartment' },
                                                    { id: 'gender', header: 'GENDER', width: 40, hidden: true, sortable: false, dataIndex: 'gender' },
                                                    { id: 'corporateEmail', header: 'CEMAIL', width: 40, hidden: true, sortable: false, dataIndex: 'corporateEmail' },
                                                    { id: 'alternateEmail', header: 'ALTEMAIL', width: 40, hidden: true, sortable: false, dataIndex: 'alternateEmail' },
                                                    { id: 'postalAddress', header: 'POSTADDR', width: 40, hidden: true, sortable: false, dataIndex: 'postalAddress' },
                                                    { id: 'residentialAddress', header: 'RESADDR', width: 40, hidden: true, sortable: false, dataIndex: 'residentialAddress' },
                                                    { id: 'alternateAccountNo', header: 'ALTACC', width: 40, hidden: true, sortable: false, dataIndex: 'alternateAccountNo' }
                                                ], stripeRows: true, autoExpandColumn: true,
                                                view: new Ext.grid.GroupingView({
                                                    forceFit: true,
                                                    groupTextTpl: '{text} ({[values.rs.length]} {[values.rs.length > 1 ? "Items" : "Item"]})',
                                                    getRowClass: function (record, index) {
                                                        var c = record;
                                                        if ((index % 1) > 0) {
                                                            return 'odd';
                                                        } else { return 'even'; }
                                                    }
                                                }), frame: true, animCollapse: false, iconCls: 'icon-grid',
                                                listeners:
                                                {
                                                    'afterrender': function () {
                                                        loadStaffList();
                                                    },
                                                    'rowclick': function (grid, rowIndex, e) {
                                                        var record = grid.getStore().getAt(rowIndex);
                                                        console.log(record.get('corporateEmail'));
                                                        Ext.getCmp('stNo').setValue(record.get('staffId'));
                                                        Ext.getCmp('sname').setValue(record.get('surname'));
                                                        Ext.getCmp('onames').setValue(record.get('othernames'));
                                                        Ext.getCmp('fname').setValue(record.get('firstname'));
                                                        Ext.getCmp('depmt').setValue(record.get('nameOfdepartment'));
                                                        if (record.get('gender') == "M") { Ext.getCmp('gender').setValue('Male'); } else { Ext.getCmp('gender').setValue('Female'); }
                                                        //Ext.getCmp('gender').setValue(record.get('gender'));
                                                        Ext.getCmp('corpemail').setValue(record.get('corporateEmail'));
                                                        Ext.getCmp('altemail').setValue(record.get('alternateEmail'));
                                                        Ext.getCmp('postAdr').setValue(record.get('postalAddress'));
                                                        Ext.getCmp('resAdr').setValue(record.get('residentialAddress'));
                                                        Ext.getCmp('accNom').setValue(record.get('accountNo'));
                                                        Ext.getCmp('altaccNom').setValue(record.get('alternateAccountNo'));
                                                    }
                                                }
                                            }),
                                            {
                                                id: '', frame: true, height: 30,
                                                tpl: new Ext.XTemplate(
                                                    '<div style="border:none;max-width:100%;text-align:center;">Total Number of Staff&nbsp;&nbsp;&nbsp;<b>{totno}</b></div>'
                                                ),
                                                id: 'paidtotamt', compiled: true, data: { totamt: "0" }, autoScroll: true
                                            }
                                        ]
                                    }
                                ]
                            },
                            { id: '', title: 'Payments module is under construction' }
                        ]
                    }
                ]
            }).show();
        }
    });
});

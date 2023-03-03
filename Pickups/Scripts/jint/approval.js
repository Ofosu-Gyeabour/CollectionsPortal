Ext.onReady(function () {

    var rkord = '';
    var nodeText = '';
    var approvedrecord = '';
    var xlsPicx = "/Images/xlsx.jpg";

    var getApprovedLoans = function (effectiveDte, grd, status) {
        $.getJSON('/Schedule/GetApprovedLoansForDate', { effDte: effectiveDte, stat: status }, function (dta) {
            var items = [];
            if (dta.status.toString() == "true") {
                $.each(dta.msg, function (i, o) {
                    items[i] = [
                                    o.date, o.Id, o.branch, o.accountNo, o.temenosAccountNo, o.staffname, o.approvedAmt, o.duration, o.intrate,
                                    o.interest, o.totalRepayment, o.monthlyDeduction, o.monthsDeducted, o.interestReceived, o.principalReceived,
                                    o.totAmtReceived, o.outstandingBalance
                               ];
                });

                grd.getStore().removeAll();
                grd.getStore().loadData(items);
            }
            else { grd.getStore().removeAll(); }
        });
    }

    Ext.get('acc-win-appr').on('click', function (e, t) {

        var WnAppr = Ext.getCmp('winAppr');

        if (!WnAppr) {
            new Ext.Window({
                id: 'winAppr', title: 'APPLICATION APPROVALS', height: 635, width: 1050, defaults: { xtype: 'panel', height: '100%' },
                resizable: true, layout: 'border', frame: true, closable: true,
                items: [
                    {
                        region: 'west', title: 'Search By Dates', width: '20%', height: 615, collapsible: true, defaults: { xtype: 'panel', frame: true },
                        items: [
                            {
                                xtype: 'form', id: 'frmDates', defaults: { xtype: 'datefield', allowBlank: false, anchor: '90%' }, labelAlign: 'top',
                                items: [
                                    { id: 'dtf', fieldLabel: 'Date From', format: 'Y/m/d' },
                                    { id: 'dto', fieldLabel: 'Date To', format: 'Y/m/d' }
                                ],
                                buttons: [
                                    {
                                        text: 'Find',
                                        listeners: {
                                            'click': function (e) {
                                                if (Ext.fly('dto').getValue() > Ext.fly('dtf').getValue()) {
                                                    $.getJSON('/Schedule/GetApprovalDates', { stDte: Ext.fly('dtf').getValue(), endDte: Ext.fly('dto').getValue() }, function (msg) {
                                                        if (msg.status.toString() == "true") {

                                                            Ext.getCmp('treeid').getRootNode().removeAll();
                                                            $.each(msg.msg, function (i, obj) {
                                                                Ext.getCmp('treeid').getRootNode().appendChild({ text: obj.dateApproved, leaf: true });
                                                            });

                                                        }
                                                        Ext.getCmp('treeid').getRootNode().expand();
                                                    });
                                                } else { Ext.Msg.alert("WRONG DATES", "Date Search values entered are not correct", this); }
                                            }

                                        }
                                    },
                                    {
                                        text: 'Reset',
                                        handler: function (btn) {
                                            Ext.getCmp('frmDates').getForm().reset();
                                        }
                                    }
                                ]
                            },
                            {
                                xtype: 'panel', id: '', title: 'Results', height: 500,
                                items: [
                                    {
                                        xtype: 'treepanel', id: 'treeid',
                                        root: {
                                            text: 'Dates', expanded: false,
                                            children: []
                                        },
                                        listeners: {
                                            'afterrender': function () { this.expand(); },
                                            'click': function (node) {
                                                nodeText = node.text;
                                                getApprovedLoans(nodeText, Ext.getCmp('grdApprovals'), 1);
                                                getApprovedLoans(nodeText, Ext.getCmp('grdAppr'), 2);
                                            }
                                        }
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        region: 'center',
                        items: [
                            {
                                xtype: 'tabpanel', id: '', deferredRender: true, activeTab: 0, tabPosition: 'bottom', enableTabScroll: true,
                                frame: true, height: 600, width: 'auto', defaults: { xtype: 'panel', frame: true, border: true },
                                items: [
                                    {
                                        xtype: 'form', id: '', title: 'PENDING APPROVAL',
                                        items: [
                                            new Ext.grid.GridPanel({
                                                id: 'grdApprovals', width: '100%', height: 400, autoScroll: true,
                                                store: new Ext.data.Store({
                                                    reader: new Ext.data.ArrayReader({}, [
                                                        { name: 'date', type: 'string' },
                                                        { name: 'Id', type: 'int' },
                                                        { name: 'branch', type: 'string' },
                                                        { name: 'accountNo', type: 'string' },
                                                        { name: 'temenosAccountNo', type: 'string' },
                                                        { name: 'staffname', type: 'string' },
                                                        { name: 'approvedAmt', type: 'float' },
                                                        { name: 'duration', type: 'int' },
                                                        { name: 'intrate', type: 'float' },
                                                        { name: 'interest', type: 'float' },
                                                        { name: 'totalRepayment', type: 'float' },
                                                        { name: 'monthlyDeduction', type: 'float' },
                                                        { name: 'monthsDeducted', type: 'float' },
                                                        { name: 'interestReceived', type: 'float' },
                                                        { name: 'principalReceived', type: 'float' },
                                                        { name: 'totAmtReceived', type: 'float' },
                                                        { name: 'outstandingBalance', type: 'float' }
                                                    ])
                                                }),
                                                columns: [
                                                    { id: 'Id', header: 'ID', hidden: true, width: 40, sortable: true, dataIndex: 'Id' },
                                                    { id: 'date', header: 'DATE', hidden: false, width: 100, sortable: true, dataIndex: 'date' },
                                                    { id: 'branch', header: 'BRANCH NAME', hidden: false, width: 100, sortable: true, dataIndex: 'branch' },
                                                    { id: 'accountNo', header: 'ACCT NO', hidden: false, width: 90, sortable: true, dataIndex: 'accountNo' },
                                                    { id: 'temenosAccountNo', header: 't24 ACCT NO', hidden: false, width: 90, sortable: true, dataIndex: 'temenosAccountNo' },
                                                    { id: 'staffname', header: 'STAFF', hidden: false, width: 120, sortable: true, dataIndex: 'staffname' },
                                                    { id: 'approvedAmt', header: 'AMOUNT', hidden: false, width: 90, sortable: true, dataIndex: 'approvedAmt' },
                                                    { id: 'duration', header: 'PERIOD', hidden: false, width: 70, sortable: true, dataIndex: 'duration' },
                                                    { id: 'intrate', header: 'RATE(%)', hidden: false, width: 70, sortable: true, dataIndex: 'intrate' },
                                                    { id: 'interest', header: 'INTEREST', hidden: false, width: 70, sortable: true, dataIndex: 'interest' },
                                                    { id: 'totalRepayment', header: 'TOT. PAY', hidden: false, width: 70, sortable: true, dataIndex: 'totalRepayment' },
                                                    { id: 'monthlyDeduction', header: 'DEDUCTIONS', hidden: true, width: 70, sortable: true, dataIndex: 'monthlyDeduction' },
                                                    { id: 'monthsDeducted', header: 'MONTHS', hidden: true, width: 70, sortable: true, dataIndex: 'monthsDeducted' },
                                                    { id: 'interestReceived', header: 'INTEREST PAID', hidden: true, width: 70, sortable: true, dataIndex: 'interestReceived' },
                                                    { id: 'principalReceived', header: 'PRINCIPAL PAID', hidden: true, width: 70, sortable: true, dataIndex: 'principalReceived' },
                                                    { id: 'totAmtReceived', header: 'TOT AMT PAID', hidden: true, width: 70, sortable: true, dataIndex: 'totAmtReceived' },
                                                    { id: 'outstandingBalance', header: 'OUTSTANDING BALANCE', hidden: true, width: 70, sortable: true, dataIndex: 'outstandingBalance' }
                                                ], stripeRows: true, autoExpandColumn: 'accountNo', viewConfig: { forceFit: true }, autoScroll: true,
                                                listeners: {
                                                    'rowclick': function (grid, rowIndex, e) {
                                                        rkord = grid.getStore().getAt(rowIndex);
                                                        console.log(rkord.data);
                                                    }
                                                }
                                            })
                                        ],
                                        buttons: [
                                            {
                                                text: 'Approve Selected',
                                                handler: function (btn) {
                                                    $.post('/Schedule/updateLoanRecord',
                                                    {
                                                        typeFlag: 's', id: rkord.data.Id, amt: rkord.data.approvedAmt, dur: rkord.data.duration, totrep: rkord.data.totalRepayment,
                                                        mthded: rkord.data.monthlyDeduction, mthpaid: 0, intpaid: 0, princpaid: 0,
                                                        totamtpaid: 0, outstandingBal: 0, mthDeffered: 0,
                                                        intDeffered: 0
                                                    },
                                                    function (res) {
                                                        if (res.status.toString() == "true") {
                                                            Ext.Msg.alert("APPROVAL STATUS", "Loan Application for " + rkord.data.staffname + " approved", this);
                                                            getApprovedLoans(nodeText, Ext.getCmp('grdApprovals'));

                                                        }
                                                        else { Ext.Msg.alert("ERROR!!!", res.msg.toString(), this); }
                                                    }, "json");
                                                }
                                            },
                                            {
                                                text: 'Approve All',
                                                handler: function (btn) {
                                                    $.post('/Schedule/updateLoanRecord',
                                                    {
                                                        typeFlag: 'a', id: 0, amt: 0, dur: 0, totrep: 0,
                                                        mthded: 0, mthpaid: 0, intpaid: 0, princpaid: 0,
                                                        totamtpaid: 0, outstandingBal: 0, mthDeffered: 0,
                                                        intDeffered: 0
                                                    },
                                                    function (res) {
                                                        if (res.status.toString() == "true") {
                                                            Ext.Msg.alert("APPROVAL STATUS", res.msg.toString(), this);
                                                            getApprovedLoans(nodeText, Ext.getCmp('grdApprovals', 1));

                                                        }
                                                        else { Ext.Msg.alert("ERROR!!!", res.msg.toString(), this); }
                                                    }, "json");
                                                }
                                            },
                                            {
                                                text: 'Generate Excel',
                                                handler: function (btn) {
                                                    if (Ext.getCmp('grdApprovals').getStore().getCount() > 0) {
                                                        window.open(document.getElementById('grdXL').href, '_blank');
                                                    }
                                                }
                                            },
                                            {
                                                tpl: new Ext.XTemplate(
                                                    '<a id="grdXL" style="display:none" href="{path}">Payment Advice (xlsx)</a>'
                                                ), compiled: true, data: { path: '/Report/generatePendingApprovalExcelData' }, autoScroll: true
                                            }
                                        ]
                                    },
                                    {
                                        title: 'APPROVALS', xtype: 'form',
                                        items: [
                                            new Ext.grid.GridPanel({
                                                id: 'grdAppr', width: '100%', height: 400, autoScroll: true,
                                                store: new Ext.data.Store({
                                                    reader: new Ext.data.ArrayReader({}, [
                                                        { name: 'date', type: 'string' },
                                                        { name: 'Id', type: 'int' },
                                                        { name: 'branch', type: 'string' },
                                                        { name: 'accountNo', type: 'string' },
                                                        { name: 'temenosAccountNo', type: 'string' },
                                                        { name: 'staffname', type: 'string' },
                                                        { name: 'approvedAmt', type: 'float' },
                                                        { name: 'duration', type: 'int' },
                                                        { name: 'intrate', type: 'float' },
                                                        { name: 'interest', type: 'float' },
                                                        { name: 'totalRepayment', type: 'float' },
                                                        { name: 'monthlyDeduction', type: 'float' },
                                                        { name: 'monthsDeducted', type: 'float' },
                                                        { name: 'interestReceived', type: 'float' },
                                                        { name: 'principalReceived', type: 'float' },
                                                        { name: 'totAmtReceived', type: 'float' }
                                                    ])
                                                }),
                                                columns: [
                                                    { id: 'Id', header: 'ID', hidden: true, width: 40, sortable: true, dataIndex: 'Id' },
                                                    { id: 'date', header: 'DATE', hidden: false, width: 100, sortable: true, dataIndex: 'date' },
                                                    { id: 'branch', header: 'BRANCH NAME', hidden: false, width: 100, sortable: true, dataIndex: 'branch' },
                                                    { id: 'accountNo', header: 'ACCT NO', hidden: false, width: 90, sortable: true, dataIndex: 'accountNo' },
                                                    { id: 'temenosAccountNo', header: 't24 ACCT NO', hidden: false, width: 90, sortable: true, dataIndex: 'temenosAccountNo' },
                                                    { id: 'staffname', header: 'STAFF', hidden: false, width: 120, sortable: true, dataIndex: 'staffname' },
                                                    { id: 'approvedAmt', header: 'AMOUNT', hidden: false, width: 90, sortable: true, dataIndex: 'approvedAmt' },
                                                    { id: 'duration', header: 'PERIOD', hidden: false, width: 70, sortable: true, dataIndex: 'duration' },
                                                    { id: 'intrate', header: 'RATE(%)', hidden: false, width: 70, sortable: true, dataIndex: 'intrate' },
                                                    { id: 'interest', header: 'INTEREST', hidden: false, width: 70, sortable: true, dataIndex: 'interest' },
                                                    { id: 'totalRepayment', header: 'TOT. PAY', hidden: false, width: 70, sortable: true, dataIndex: 'totalRepayment' },
                                                    { id: 'monthlyDeduction', header: 'DEDUCTIONS', hidden: false, width: 70, sortable: true, dataIndex: 'monthlyDeduction' },
                                                    { id: 'monthsDeducted', header: 'MONTHS', hidden: false, width: 70, sortable: true, dataIndex: 'monthsDeducted' },
                                                    { id: 'interestReceived', header: 'INTEREST PAID', hidden: false, width: 70, sortable: true, dataIndex: 'interestReceived' },
                                                    { id: 'principalReceived', header: 'PRINCIPAL PAID', hidden: false, width: 70, sortable: true, dataIndex: 'principalReceived' },
                                                    { id: 'totAmtReceived', header: 'TOT AMT PAID', hidden: false, width: 70, sortable: true, dataIndex: 'totAmtReceived' },
                                                    { id: 'outstandingBalance', header: 'OUTSTANDING BALANCE', hidden: false, width: 70, sortable: true, dataIndex: 'outstandingBalance' }
                                                ], stripeRows: true, autoExpandColumn: 'accountNo', viewConfig: { forceFit: true }, autoScroll: true,
                                                listeners: {
                                                    'rowclick': function (grid, rowIndex, e) {
                                                        approvedrecord = grid.getStore().getAt(rowIndex);
                                                        console.log();
                                                    }
                                                }
                                            })
                                        ],
                                        buttons: [
                                            {
                                                text: 'Reverse Selected Approval',
                                                handler: function (btn) {
                                                    Ext.Msg.alert("status", "not implemented yet", this);
                                                }
                                            },
                                            {
                                                text: 'Generate Approved Data',
                                                handler: function (btn) {
                                                    if (Ext.getCmp('grdAppr').getStore().getCount() > 0) {
                                                        window.open(document.getElementById('grdAprXL').href, '_blank');
                                                    }
                                                }
                                            },
                                            {
                                                tpl: new Ext.XTemplate(
                                                    '<a id="grdAprXL" style="display:none" href="{path}">Payment Advice (xlsx)</a>'
                                                ), compiled: true, data: { path: '/Report/generateApprovedExcelData' }, autoScroll: true
                                            }
                                        ]
                                    },
                                    {
                                        title: 'DEDUCTIONS', defaults: { frame: true, border: true, xtype: 'panel' }, layout: 'column',
                                        items: [
                                            {
                                                width: '20%', height: 525,
                                                items: [
                                                    {
                                                        title: 'PAYMENT', xtype: 'treepanel', id: 'treeidx', collapsible: true,
                                                        root: {
                                                            text: 'Payments', expanded: true,
                                                            children: [
                                                                {
                                                                    text: 'Single Payment', leaf: true,
                                                                    listeners: {
                                                                        'click': function () {
                                                                            Ext.getCmp('paymnu').layout.setActiveItem(0);
                                                                        }
                                                                    }
                                                                },
                                                                {
                                                                    text: 'Bulk Payment', leaf: true,
                                                                    listeners: {
                                                                        'click': function () {
                                                                            Ext.getCmp('paymnu').layout.setActiveItem(1);
                                                                        }
                                                                    }
                                                                },
                                                                {
                                                                    text: 'download Templates', leaf: true,
                                                                    listeners: {
                                                                        'click': function () {
                                                                            Ext.getCmp('paymnu').layout.setActiveItem(2);
                                                                        }
                                                                    }
                                                                },
                                                                {
                                                                    text: 'Payment Report', leaf: false,
                                                                    children: []
                                                                }
                                                            ]
                                                        }
                                                    }
                                                ]
                                            },
                                            {
                                                id: 'paymnu', width: '80%', height: 525, layout: 'card', activeItem: 0,
                                                items: [
                                                    {
                                                        xtype: 'panel', id: 'frmTest', title: 'Single Payment', fileUpload: true,
                                                        bodyStyle: 'padding: 10px 10px 10px 10px;', defaults: { allowBlank: false, msgTarget: 'side' },
                                                        listeners: {
                                                            'afterrender': function () {
                                                                this.load({ url: '/Schedule/fupl', scripts: true });
                                                            }
                                                        }
                                                    },
                                                    { title: 'Bulk Payment' },
                                                    {
                                                        layout: 'column', defaults: { xtype: 'form', border: true, frame: true },
                                                        items: [
                                                            {
                                                                title: 'single payment file',
                                                                width: '50%',
                                                                items: [
                                                                    {
                                                                        tpl: new Ext.XTemplate(
                                                                            '<a href="{path}">Payment Advice (xlsx)',
                                                                                '<img id="x" src="{imgpath}" alt="{alternative}">',
                                                                            '</a>'
                                                                        ), 
                                                                        id: 'xt',compiled: true, data: { imgpath: xlsPicx, alternative:'testing' }, autoScroll: true
                                                                    }
                                                                ]
                                                            },
                                                            { title: 'bulk payment file', width: '50%' }
                                                        ]
                                                    }
                                                ]
                                            }
                                        ],
                                        buttons: [
                                            { text: 'testing button' }
                                        ]

                                    }
                                ]
                            }
                        ]
                    },
                    {
                        region: 'east'
                    }
                ]

            }).show();
        } else { Ext.Msg.alert("error", "something went wrong", this); console.log(WnAppr); }

    });

});